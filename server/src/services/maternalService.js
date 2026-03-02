/**
 * Maternal Health Module
 * Pregnancy-specific rules and guidance.
 */

const MATERNAL_RULES = [
  {
    id: "high_risk_pregnancy",
    condition: (d) =>
      d.pregnant &&
      d.systolicBP != null &&
      d.systolicBP > 140,
    label: "High-Risk Pregnancy",
    guidance:
      "Refer to PHC within 6 hours. Monitor BP frequently. Advise rest.",
  },
  {
    id: "anemia",
    condition: (d) => d.hemoglobin != null && d.hemoglobin < 10,
    label: "Anemia Warning",
    guidance: "Iron supplementation recommended. Follow up in 2 weeks.",
  },
  {
    id: "preeclampsia_risk",
    condition: (d) =>
      d.pregnant &&
      d.swelling === true &&
      d.severeHeadache === true &&
      d.systolicBP != null &&
      d.systolicBP > 140,
    label: "Possible Preeclampsia",
    guidance: "Urgent referral. Monitor BP and urine protein. Rest.",
  },
];

function evaluateMaternal(data) {
  const alerts = [];
  const guidance = [];

  for (const rule of MATERNAL_RULES) {
    if (rule.condition(data)) {
      alerts.push({ id: rule.id, label: rule.label });
      guidance.push(rule.guidance);
    }
  }

  if (data.pregnant && !alerts.length) {
    guidance.push("Continue routine antenatal care. Monitor vitals.");
  }

  return {
    alerts,
    guidance: [...new Set(guidance)],
    isPregnant: !!data.pregnant,
    trimester: data.trimester ?? null,
    hemoglobin: data.hemoglobin ?? null,
  };
}

module.exports = { evaluateMaternal, MATERNAL_RULES };
