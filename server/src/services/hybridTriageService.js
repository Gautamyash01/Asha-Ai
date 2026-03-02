/**
 * Hybrid Triage Engine (Rules + ML)
 * 1. Run rule-based safety layer first
 * 2. If no critical rule triggers, run ML prediction
 */

const { runSafetyRules } = require("./ruleEngine");
const { predictRisk } = require("./mlPredictionService");
const { evaluateMaternal } = require("./maternalService");

const ACTIONS = {
  Critical: "Refer to hospital immediately",
  Emergency: "Refer to PHC/hospital immediately",
  HighRiskPregnancy: "Refer to PHC within 6 hours",
  Red: "Refer to PHC within 6 hours",
  Yellow: "Monitor vitals daily. Follow up in 2-3 days.",
  Green: "Home care. Provide ORS if needed. Follow up if symptoms worsen.",
};

function getRecommendedAction(category, ruleTrigger) {
  if (ruleTrigger?.action) return ruleTrigger.action;
  return ACTIONS[category] ?? "Continue monitoring.";
}

async function runHybridTriage(data) {
  const ruleResult = runSafetyRules(data);
  if (ruleResult) {
    return {
      triggeredByRule: true,
      ruleId: ruleResult.ruleId,
      riskCategory: ruleResult.category,
      riskLabel: ruleResult.label,
      riskProbability: 1,
      reason: [ruleResult.reason],
      topContributingFactors: [ruleResult.reason],
      recommendedAction: ruleResult.action,
      maternal: data.pregnant ? evaluateMaternal(data) : null,
    };
  }

  const mlResult = await predictRisk({
    age: data.age,
    gender: data.gender,
    pregnant: data.pregnant,
    systolicBP: data.systolicBP,
    diastolicBP: data.diastolicBP,
    bloodSugar: data.bloodSugar,
    temperature: data.temperature,
    spo2: data.spo2,
    heartRate: data.heartRate,
    fever: data.symptoms?.includes?.("fever") ?? data.fever,
    cough: data.symptoms?.includes?.("cough") ?? data.cough,
    breathlessness: data.symptoms?.includes?.("breathlessness") ?? data.breathlessness,
    symptomDuration: data.symptomDuration,
  });

  const topFactors = (mlResult.topFeatures || []).map(
    (f) => (typeof f === "object" ? f.feature : f) + (f.importance != null ? ` (${(f.importance * 100).toFixed(0)}%)` : "")
  );

  const maternal = data.pregnant ? evaluateMaternal(data) : null;

  return {
    triggeredByRule: false,
    riskCategory: mlResult.riskCategory ?? "Green",
    riskLabel: mlResult.riskCategory ?? "Green",
    riskProbability: mlResult.riskProbability ?? 0.2,
    reason: topFactors,
    topContributingFactors: topFactors.slice(0, 3),
    recommendedAction: getRecommendedAction(mlResult.riskCategory),
    maternal,
  };
}

module.exports = { runHybridTriage };
