export const triageRules = [
  {
    condition: (data) => data.pregnant && data.bp > 140,
    level: "HIGH",
    action: "Refer to PHC within 24 hours",
  },
  {
    condition: (data) => data.hemoglobin < 9,
    level: "HIGH",
    action: "Immediate medical attention required",
  },
];