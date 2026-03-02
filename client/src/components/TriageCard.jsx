const TriageCard = ({ result }) => {
  if (!result) return null;

  const high = result.level === "HIGH";

  return (
    <div
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        background: high ? "#fee2e2" : "#dcfce7",
        textAlign: "center"
      }}
    >
      <h2 style={{ color: high ? "#dc2626" : "#16a34a" }}>
        {result.level} RISK
      </h2>

      <p>{result.action}</p>
    </div>
  );
};

export default TriageCard;