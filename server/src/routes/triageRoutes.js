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
  try {
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

    const result = await runHybridTriage(vitals);

    const patientId = body.patientId || randomUUID();
    const encounterId = randomUUID();
    createPatient({ id: patientId, gender: vitals.gender });
    createEncounter(patientId, { id: encounterId });
    saveTriageToDb(patientId, encounterId, vitals, result);

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Triage failed" });
  }
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
