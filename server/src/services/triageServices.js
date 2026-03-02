import { triageRules } from "../data/triageRules.js";

export const runTriage = (data) => {
  for (let rule of triageRules) {
    if (rule.condition(data)) {
      return {
        level: rule.level,
        action: rule.action,
      };
    }
  }

  return {
    level: "LOW",
    action: "Home care",
  };
};