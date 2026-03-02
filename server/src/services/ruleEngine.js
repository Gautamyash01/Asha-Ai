/**
 * Rule-Based Safety Layer (Priority 1)
 * Runs BEFORE ML. If any rule triggers, skip ML and return structured response.
 */

const SAFETY_RULES = [
  {
    id: "spo2_critical",
    condition: (d) => d.spo2 != null && d.spo2 < 90,
    category: "Critical",
    label: "Critical – Immediate Referral",
    action: "Patient has low oxygen (SpO2 < 90%). Refer to hospital immediately.",
    reason: "Low oxygen level (SpO2 < 90%)",
  },
  {
    id: "bp_emergency",
    condition: (d) => d.systolicBP != null && d.systolicBP > 180,
    category: "Emergency",
    label: "Emergency – Refer Immediately",
    action: "Severe hypertension. Refer to PHC/hospital immediately.",
    reason: "Very high blood pressure (Systolic BP > 180)",
  },
  {
    id: "high_risk_pregnancy",
    condition: (d) =>
      d.pregnant === true &&
      d.systolicBP != null &&
      d.systolicBP > 140,
    category: "HighRiskPregnancy",
    label: "High-Risk Pregnancy",
    action: "Pregnant patient with high BP. Refer to PHC within 6 hours.",
    reason: "Pregnant with high blood pressure (>140)",
  },
  {
    id: "diabetic_emergency",
    condition: (d) => d.bloodSugar != null && d.bloodSugar > 300,
    category: "Emergency",
    label: "Diabetic Emergency",
    action: "Very high blood sugar. Provide immediate care and refer if needed.",
    reason: "Blood sugar > 300 mg/dL",
  },
];

/**
 * Run rule-based safety checks. Returns first matching rule or null.
 */
function runSafetyRules(data) {
  for (const rule of SAFETY_RULES) {
    if (rule.condition(data)) {
      return {
        triggered: true,
        ruleId: rule.id,
        category: rule.category,
        label: rule.label,
        action: rule.action,
        reason: rule.reason,
      };
    }
  }
  return null;
}

module.exports = { runSafetyRules, SAFETY_RULES };
