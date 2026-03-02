import { useState } from "react";
import { runTriage } from "../services/api";
import { runSafetyRules, evaluateMaternal } from "../lib/ruleEngine";
import { savePatientLocal } from "../lib/offlineStore";

const PatientForm = ({ setResult }) => {
  const [form, setForm] = useState({
    age: "",
    gender: "female",
    pregnant: false,
    systolicBP: "",
    diastolicBP: "",
    bloodSugar: "",
    temperature: "",
    spo2: "",
    heartRate: "",
    symptomDuration: "1",
    fever: false,
    cough: false,
    breathlessness: false,
    hemoglobin: "",
    trimester: "",
    swelling: false,
    severeHeadache: false,
  });
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  window.addEventListener("online", () => setOffline(false));
  window.addEventListener("offline", () => setOffline(true));

  const handleSubmit = async () => {
    setLoading(true);
    const data = {
      age: +form.age || 30,
      gender: form.gender,
      pregnant: form.pregnant,
      systolicBP: +form.systolicBP || 120,
      diastolicBP: +form.diastolicBP || 80,
      bloodSugar: +form.bloodSugar || 100,
      temperature: +form.temperature || 37,
      spo2: +form.spo2 || 97,
      heartRate: +form.heartRate || 80,
      symptomDuration: +form.symptomDuration || 1,
      fever: form.fever,
      cough: form.cough,
      breathlessness: form.breathlessness,
      hemoglobin: form.hemoglobin ? +form.hemoglobin : null,
      trimester: form.trimester || null,
      swelling: form.swelling,
      severeHeadache: form.severeHeadache,
      symptoms: [
        ...(form.fever ? ["fever"] : []),
        ...(form.cough ? ["cough"] : []),
        ...(form.breathlessness ? ["breathlessness"] : []),
      ],
    };

    let res;
    try {
      const apiRes = await runTriage(data);
      res = apiRes.data;
      await savePatientLocal({ ...data, result: res, ts: Date.now() });
    } catch {
      const ruleRes = runSafetyRules(data);
      if (ruleRes) {
        res = {
          riskLevel: ruleRes.label,
          riskCategory: ruleRes.category,
          riskProbability: 1,
          reason: [ruleRes.reason],
          recommendedAction: ruleRes.action,
          maternal: form.pregnant ? evaluateMaternal(data) : null,
          triggeredByRule: true,
        };
      } else {
        res = {
          riskLevel: "Green",
          riskCategory: "Green",
          riskProbability: 0.2,
          reason: ["No critical signs. Monitor at home."],
          recommendedAction: "Home care. Provide ORS if needed. Follow up if symptoms worsen.",
          maternal: form.pregnant ? evaluateMaternal(data) : null,
          triggeredByRule: false,
        };
      }
      await savePatientLocal({ ...data, result: res, ts: Date.now(), offline: true });
    }
    setResult(res);
    setLoading(false);
  };

  return (
    <div style={styles.form}>
      <div style={styles.row}>
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          style={styles.input}
        />
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          style={styles.input}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style={styles.row}>
        <input
          type="number"
          placeholder="Systolic BP"
          value={form.systolicBP}
          onChange={(e) => setForm({ ...form, systolicBP: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Diastolic BP"
          value={form.diastolicBP}
          onChange={(e) => setForm({ ...form, diastolicBP: e.target.value })}
          style={styles.input}
        />
      </div>
      <div style={styles.row}>
        <input
          type="number"
          placeholder="Blood Sugar (mg/dL)"
          value={form.bloodSugar}
          onChange={(e) => setForm({ ...form, bloodSugar: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="SpO2 (%)"
          value={form.spo2}
          onChange={(e) => setForm({ ...form, spo2: e.target.value })}
          style={styles.input}
        />
      </div>
      <div style={styles.row}>
        <input
          type="number"
          step="0.1"
          placeholder="Temp (°C)"
          value={form.temperature}
          onChange={(e) => setForm({ ...form, temperature: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Heart Rate"
          value={form.heartRate}
          onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
          style={styles.input}
        />
      </div>
      <div style={styles.row}>
        <input
          type="number"
          placeholder="Symptom Duration (days)"
          value={form.symptomDuration}
          onChange={(e) => setForm({ ...form, symptomDuration: e.target.value })}
          style={styles.input}
        />
      </div>

      <div style={styles.checkboxes}>
        <label style={styles.check}>
          <input
            type="checkbox"
            checked={form.pregnant}
            onChange={(e) => setForm({ ...form, pregnant: e.target.checked })}
          />{" "}
          Pregnant
        </label>
        <label style={styles.check}>
          <input
            type="checkbox"
            checked={form.fever}
            onChange={(e) => setForm({ ...form, fever: e.target.checked })}
          />{" "}
          Fever
        </label>
        <label style={styles.check}>
          <input
            type="checkbox"
            checked={form.cough}
            onChange={(e) => setForm({ ...form, cough: e.target.checked })}
          />{" "}
          Cough
        </label>
        <label style={styles.check}>
          <input
            type="checkbox"
            checked={form.breathlessness}
            onChange={(e) => setForm({ ...form, breathlessness: e.target.checked })}
          />{" "}
          Breathlessness
        </label>
      </div>

      {form.pregnant && (
        <div style={styles.maternal}>
          <h4 style={styles.maternalTitle}>Maternal Health</h4>
          <input
            type="number"
            step="0.1"
            placeholder="Hemoglobin (g/dL)"
            value={form.hemoglobin}
            onChange={(e) => setForm({ ...form, hemoglobin: e.target.value })}
            style={styles.input}
          />
          <select
            value={form.trimester}
            onChange={(e) => setForm({ ...form, trimester: e.target.value })}
            style={styles.input}
          >
            <option value="">Select trimester</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
          </select>
          <label style={styles.check}>
            <input
              type="checkbox"
              checked={form.swelling}
              onChange={(e) => setForm({ ...form, swelling: e.target.checked })}
            />{" "}
            Swelling
          </label>
          <label style={styles.check}>
            <input
              type="checkbox"
              checked={form.severeHeadache}
              onChange={(e) => setForm({ ...form, severeHeadache: e.target.checked })}
            />{" "}
            Severe headache
          </label>
        </div>
      )}

      {offline && <p style={styles.offline}>Offline mode – using local rules</p>}
      <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
        {loading ? "Running..." : "Run Triage"}
      </button>
    </div>
  );
};

const styles = {
  form: { maxWidth: 400, margin: "0 auto", padding: 16 },
  row: { display: "flex", gap: 8, marginBottom: 8 },
  input: { flex: 1, padding: 10, fontSize: 16, borderRadius: 8, border: "1px solid #ccc" },
  checkboxes: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 },
  check: { fontSize: 14, cursor: "pointer" },
  maternal: { background: "#f8f9fa", padding: 12, borderRadius: 8, marginBottom: 12 },
  maternalTitle: { margin: "0 0 8px 0", fontSize: 14 },
  offline: { color: "#856404", fontSize: 12, marginBottom: 8 },
  btn: { width: "100%", padding: 14, fontSize: 16, background: "#0d9488", color: "white", border: "none", borderRadius: 8, cursor: "pointer" },
};

export default PatientForm;
