/**
 * ML Risk Prediction Service
 * Uses RandomForest model via Python script. Falls back to heuristic if Python/model unavailable.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PYTHON_SCRIPT = path.join(__dirname, "../../scripts/predict_risk.py");

/**
 * Call Python prediction script. Returns null on failure (use fallback).
 */
function runPythonPrediction(data) {
  return new Promise((resolve) => {
    if (!fs.existsSync(PYTHON_SCRIPT)) {
      resolve(null);
      return;
    }
    const python = process.platform === "win32" ? "python" : "python3";
    const proc = spawn(python, [PYTHON_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    proc.stdout.on("data", (d) => (out += d.toString()));
    proc.stderr.on("data", (d) => (err += d.toString()));
    proc.on("close", (code) => {
      if (code !== 0) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(out));
      } catch {
        resolve(null);
      }
    });
    proc.on("error", () => resolve(null));
    proc.stdin.write(JSON.stringify(data));
    proc.stdin.end();
  });
}

/**
 * Fallback heuristic when ML model is unavailable.
 */
function fallbackHeuristic(data) {
  let prob = 0.15;
  const topReasons = [];

  const spo2 = data.spo2 ?? 97;
  if (spo2 < 92) {
    prob += 0.25;
    topReasons.push({ feature: "Low SpO2", importance: 0.3 });
  } else if (spo2 < 95) {
    prob += 0.1;
    topReasons.push({ feature: "Borderline SpO2", importance: 0.15 });
  }

  const sysBP = data.systolicBP ?? 120;
  if (sysBP > 160) {
    prob += 0.2;
    topReasons.push({ feature: "High blood pressure", importance: 0.25 });
  } else if (sysBP > 140) {
    prob += 0.1;
    topReasons.push({ feature: "Elevated blood pressure", importance: 0.12 });
  }

  const bs = data.bloodSugar ?? 100;
  if (bs > 250) {
    prob += 0.2;
    topReasons.push({ feature: "High blood sugar", importance: 0.22 });
  }

  if (data.pregnant && sysBP > 130) {
    prob += 0.25;
    topReasons.push({ feature: "Pregnancy + high BP", importance: 0.28 });
  }

  const temp = data.temperature ?? 37;
  if (temp > 38.5) {
    prob += 0.1;
    topReasons.push({ feature: "Fever", importance: 0.1 });
  }

  const age = data.age ?? 30;
  if (age > 60 || age < 5) {
    prob += 0.08;
    topReasons.push({ feature: "Age risk", importance: 0.08 });
  }

  if (data.fever && data.cough && data.breathlessness) {
    prob += 0.15;
    topReasons.push({ feature: "Respiratory symptoms", importance: 0.15 });
  }

  const riskProbability = Math.min(prob, 0.95);
  const riskCategory =
    riskProbability > 0.6 ? "Red" : riskProbability > 0.3 ? "Yellow" : "Green";
  const topFeatures = topReasons
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 3);

  return { riskProbability, riskCategory, topFeatures };
}

/**
 * Predict risk using ML (or fallback). Input must include all required features.
 */
async function predictRisk(data) {
  const ruleResult = await runPythonPrediction({
    age: data.age ?? 30,
    gender: data.gender ?? "female",
    pregnant: !!data.pregnant,
    systolicBP: data.systolicBP ?? 120,
    diastolicBP: data.diastolicBP ?? 80,
    bloodSugar: data.bloodSugar ?? 100,
    temperature: data.temperature ?? 37,
    spo2: data.spo2 ?? 97,
    heartRate: data.heartRate ?? 80,
    fever: data.fever ?? data.symptoms?.includes?.("fever"),
    cough: data.cough ?? data.symptoms?.includes?.("cough"),
    breathlessness:
      data.breathlessness ?? data.symptoms?.includes?.("breathlessness"),
    symptomDuration: data.symptomDuration ?? 1,
  });

  if (ruleResult && !ruleResult.error) {
    return ruleResult;
  }
  return fallbackHeuristic(data);
}

module.exports = { predictRisk, fallbackHeuristic };
