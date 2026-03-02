import { useState } from "react";
import PatientForm from "./components/PatientForm";
import TriageCard from "./components/TriageCard";

function copySummary(result) {
  const lines = [
    "=== PATIENT TRIAGE SUMMARY ===",
    `Risk Level: ${result.riskLevel || result.riskCategory}`,
    "",
    "Reason:",
    ...(result.reason || result.topContributingFactors || []).map((r) => `- ${typeof r === "string" ? r : r.feature || r}`),
    "",
    "Recommended Action:",
    result.recommendedAction || "Continue monitoring.",
  ];
  if (result.maternal?.alerts?.length) {
    lines.push("", "Maternal:", ...result.maternal.alerts.map((a) => `- ${a.label}`));
  }
  navigator.clipboard?.writeText(lines.join("\n"));
  alert("Summary copied to clipboard.");
}

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="app" style={styles.app}>
      <h1 style={styles.title}>ASHA AI Assistant</h1>
      <p style={styles.subtitle}>Simple triage for rural health workers</p>
      <PatientForm setResult={setResult} />
      <TriageCard result={result} onExportSummary={copySummary} />
    </div>
  );
}

const styles = {
  app: { fontFamily: "system-ui", maxWidth: 480, margin: "0 auto", padding: 20 },
  title: { fontSize: 24, marginBottom: 4 },
  subtitle: { color: "#6b7280", fontSize: 14, marginBottom: 20 },
};

export default App;
