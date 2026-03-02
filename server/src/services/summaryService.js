/**
 * Doctor Summary Generator
 * Produces structured case summary for doctors.
 */

function generateDoctorSummary({
  patient,
  vitals,
  triageResult,
  ruleTrigger,
  maternalResult,
  timestamp,
}) {
  const summary = {
    generatedAt: timestamp || new Date().toISOString(),
    patient: {
      id: patient?.id,
      age: patient?.age ?? vitals?.age,
      gender: patient?.gender ?? vitals?.gender,
      name: patient?.name,
    },
    vitals: {
      systolicBP: vitals?.systolicBP,
      diastolicBP: vitals?.diastolicBP,
      bloodSugar: vitals?.bloodSugar,
      temperature: vitals?.temperature,
      spo2: vitals?.spo2,
      heartRate: vitals?.heartRate,
      hemoglobin: vitals?.hemoglobin,
    },
    risk: {
      category: triageResult?.riskCategory ?? ruleTrigger?.category,
      probability: triageResult?.riskProbability,
      label: ruleTrigger?.label ?? triageResult?.riskCategory,
    },
    ruleTriggers: ruleTrigger
      ? [
          {
            id: ruleTrigger.ruleId,
            label: ruleTrigger.label,
            action: ruleTrigger.action,
          },
        ]
      : [],
    mlExplanation: triageResult?.topFeatures ?? [],
    maternal: maternalResult
      ? {
          alerts: maternalResult.alerts,
          guidance: maternalResult.guidance,
          trimester: maternalResult.trimester,
          hemoglobin: maternalResult.hemoglobin,
        }
      : null,
    recommendedAction:
      ruleTrigger?.action ?? triageResult?.recommendedAction ?? "Continue monitoring.",
  };

  return summary;
}

function toCopyableText(summary) {
  const lines = [
    "=== PATIENT CASE SUMMARY ===",
    `Generated: ${summary.generatedAt}`,
    "",
    "PATIENT:",
    `  Age: ${summary.patient?.age ?? "N/A"}, Gender: ${summary.patient?.gender ?? "N/A"}`,
    `  Name: ${summary.patient?.name ?? "N/A"}`,
    "",
    "VITALS:",
    `  BP: ${summary.vitals?.systolicBP ?? "N/A"}/${summary.vitals?.diastolicBP ?? "N/A"} mmHg`,
    `  Blood Sugar: ${summary.vitals?.bloodSugar ?? "N/A"} mg/dL`,
    `  Temp: ${summary.vitals?.temperature ?? "N/A"}°C, SpO2: ${summary.vitals?.spo2 ?? "N/A"}%`,
    `  Heart Rate: ${summary.vitals?.heartRate ?? "N/A"} bpm`,
    `  Hemoglobin: ${summary.vitals?.hemoglobin ?? "N/A"} g/dL`,
    "",
    "RISK:",
    `  Category: ${summary.risk?.category ?? "N/A"}`,
    `  Probability: ${summary.risk?.probability != null ? (summary.risk.probability * 100).toFixed(1) + "%" : "N/A"}`,
    "",
    "RULE TRIGGERS:",
    ...(summary.ruleTriggers?.length
      ? summary.ruleTriggers.map((r) => `  - ${r.label}: ${r.action}`)
      : ["  None"]),
    "",
    "TOP CONTRIBUTING FACTORS:",
    ...(summary.mlExplanation?.length
      ? summary.mlExplanation.map((f) => `  - ${f.feature}`)
      : ["  N/A"]),
    "",
    "MATERNAL:",
    ...(summary.maternal?.alerts?.length
      ? summary.maternal.alerts.map((a) => `  - ${a.label}`)
      : ["  N/A"]),
    ...(summary.maternal?.guidance?.length
      ? summary.maternal.guidance.map((g) => `  - ${g}`)
      : []),
    "",
    "RECOMMENDED ACTION:",
    `  ${summary.recommendedAction}`,
  ];
  return lines.join("\n");
}

module.exports = { generateDoctorSummary, toCopyableText };
