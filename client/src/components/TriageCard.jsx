/**
 * ASHA-Friendly Output
 * Shows: RISK LEVEL (color-coded), Reason, Recommended Action
 * No technical ML metrics.
 */
const TriageCard = ({ result, onExportSummary }) => {
  if (!result) return null;

  const cat = result.riskCategory || result.riskLevel || "Green";
  const isRed = ["Critical", "Emergency", "Red", "HighRiskPregnancy"].includes(cat);
  const isYellow = ["Yellow"].includes(cat);

  const bgColor = isRed ? "#fee2e2" : isYellow ? "#fef3c7" : "#dcfce7";
  const textColor = isRed ? "#dc2626" : isYellow ? "#b45309" : "#16a34a";
  const borderColor = isRed ? "#fca5a5" : isYellow ? "#fcd34d" : "#86efac";

  const reasons = result.reason || result.topContributingFactors || [];
  const action = result.recommendedAction || "Continue monitoring.";

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        background: bgColor,
        border: `2px solid ${borderColor}`,
        textAlign: "left",
      }}
    >
      <h2 style={{ color: textColor, margin: "0 0 12px 0", fontSize: 20 }}>
        RISK LEVEL: {result.riskLevel || cat}
      </h2>

      {reasons.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong style={{ fontSize: 14 }}>Reason:</strong>
          <ul style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                {typeof r === "string" ? r : r.feature || r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: 14 }}>Recommended Action:</strong>
        <p style={{ margin: "4px 0 0 0", lineHeight: 1.5 }}>{action}</p>
      </div>

      {result.maternal?.alerts?.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.1)" }}>
          <strong style={{ fontSize: 14 }}>Maternal:</strong>
          <ul style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
            {result.maternal.alerts.map((a, i) => (
              <li key={i}>{a.label}</li>
            ))}
          </ul>
          {result.maternal.guidance?.length > 0 && (
            <p style={{ marginTop: 4, fontSize: 13 }}>{result.maternal.guidance.join(". ")}</p>
          )}
        </div>
      )}

      {onExportSummary && (
        <button
          onClick={() => onExportSummary(result)}
          style={{
            marginTop: 12,
            padding: "8px 16px",
            fontSize: 14,
            background: "#374151",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Copy Summary for Doctor
        </button>
      )}
    </div>
  );
};

export default TriageCard;
