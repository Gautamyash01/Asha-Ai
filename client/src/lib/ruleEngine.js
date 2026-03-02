/**
 * Client-side rule engine for offline triage.
 * Matches server safety rules.
 */
export function runSafetyRules(data) {
  const spo2 = data.spo2 ?? 97;
  const systolicBP = data.systolicBP ?? 120;
  const pregnant = !!data.pregnant;
  const bloodSugar = data.bloodSugar ?? 100;

  if (spo2 < 90) {
    return { category: "Critical", label: "Critical – Immediate Referral", reason: "Low oxygen level (SpO2 < 90%)", action: "Patient has low oxygen. Refer to hospital immediately." };
  }
  if (systolicBP > 180) {
    return { category: "Emergency", label: "Emergency – Refer Immediately", reason: "Very high blood pressure (Systolic BP > 180)", action: "Severe hypertension. Refer to PHC/hospital immediately." };
  }
  if (pregnant && systolicBP > 140) {
    return { category: "HighRiskPregnancy", label: "High-Risk Pregnancy", reason: "Pregnant with high blood pressure (>140)", action: "Refer to PHC within 6 hours." };
  }
  if (bloodSugar > 300) {
    return { category: "Emergency", label: "Diabetic Emergency", reason: "Blood sugar > 300 mg/dL", action: "Very high blood sugar. Provide immediate care and refer if needed." };
  }
  return null;
}

export function evaluateMaternal(data) {
  const alerts = [];
  const guidance = [];
  if (data.pregnant && data.systolicBP > 140) {
    alerts.push({ label: "High-Risk Pregnancy" });
    guidance.push("Refer to PHC within 6 hours. Monitor BP frequently.");
  }
  if (data.hemoglobin != null && data.hemoglobin < 10) {
    alerts.push({ label: "Anemia Warning" });
    guidance.push("Iron supplementation recommended. Follow up in 2 weeks.");
  }
  if (data.pregnant && data.swelling && data.severeHeadache && data.systolicBP > 140) {
    alerts.push({ label: "Possible Preeclampsia" });
    guidance.push("Urgent referral. Monitor BP and urine protein.");
  }
  if (data.pregnant && !alerts.length) {
    guidance.push("Continue routine antenatal care. Monitor vitals.");
  }
  return { alerts, guidance };
}
