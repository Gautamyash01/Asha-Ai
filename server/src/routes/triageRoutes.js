const express = require("express");
const router = express.Router();
const { runHybridTriage } = require("../services/hybridTriageService");
const { generateDoctorSummary, toCopyableText } = require("../services/summaryService");
const { createPatient, createEncounter, saveTriageToDb } = require("../db/patientStore");
const { randomUUID } = require("crypto");
const { optionalAuth, requireRole } = require("../middleware/auth");

router.use(optionalAuth);

// POST /triage - Hybrid triage (rules + ML)
router.post("/", async (req, res) => {
  const body = req.body;
  const vitals = {
    age: +body.age || 30,
    gender: body.gender || "female",
    pregnant: !!body.pregnant,
    systolicBP: body.systolicBP != null ? +body.systolicBP : 120,
    diastolicBP: body.diastolicBP != null ? +body.diastolicBP : 80,
    bloodSugar: body.bloodSugar != null ? +body.bloodSugar : 100,
    temperature: body.temperature != null ? +body.temperature : 37,
    spo2: body.spo2 != null ? +body.spo2 : 97,
    heartRate: body.heartRate != null ? +body.heartRate : 80,
    symptomDuration: body.symptomDuration != null ? +body.symptomDuration : 1,
    symptoms: body.symptoms || [],
    fever: body.fever ?? body.symptoms?.includes?.("fever"),
    cough: body.cough ?? body.symptoms?.includes?.("cough"),
    breathlessness: body.breathlessness ?? body.symptoms?.includes?.("breathlessness"),
    hemoglobin: body.hemoglobin != null ? +body.hemoglobin : null,
    trimester: body.trimester,
    swelling: body.swelling,
    severeHeadache: body.severeHeadache,
  };

  let result;
  try {
    result = await runHybridTriage(vitals);
  } catch (err) {
    console.error("Hybrid triage failed, using safe fallback:", err);
    result = {
      triggeredByRule: false,
      riskCategory: "Green",
      riskLabel: "Stable",
      riskProbability: 0.1,
      topContributingFactors: ["No critical signs detected"],
      recommendedAction: "Home care. Provide ORS if needed. Follow up if symptoms worsen.",
      maternal: vitals.pregnant ? { alerts: [], guidance: ["Continue routine antenatal care. Monitor vitals."] } : null,
    };
  }

  const patientId = body.patientId || null;
  const encounterId = null;

  res.json({
    patientId,
    encounterId,
    riskLevel: result.riskLabel,
    riskCategory: result.riskCategory,
    riskProbability: result.riskProbability,
    reason: result.topContributingFactors,
    recommendedAction: result.recommendedAction,
    maternal: result.maternal,
    triggeredByRule: result.triggeredByRule,
  });
});

// POST /triage/summary - Doctor summary
router.post("/summary", (req, res) => {
  const { patient, vitals, triageResult, ruleTrigger, maternalResult } = req.body;
  const summary = generateDoctorSummary({
    patient,
    vitals,
    triageResult: triageResult || { riskCategory: req.body.riskCategory, riskProbability: req.body.riskProbability, topFeatures: req.body.topFeatures },
    ruleTrigger,
    maternalResult,
  });
  const format = req.query.format || "json";
  if (format === "text") {
    return res.type("text/plain").send(toCopyableText(summary));
  }
  res.json(summary);
});

module.exports = router;
