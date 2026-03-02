const express = require("express");
const router = express.Router();
const { getDb } = require("../db/schema");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);
router.use(requireRole("Admin", "Doctor"));

router.get("/stats", (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const patientsToday = db
    .prepare(
      `SELECT COUNT(DISTINCT patientId) as cnt FROM Encounter WHERE date(startedAt) = ?`
    )
    .get(today);

  const criticalCases = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM Condition WHERE riskCategory IN ('Critical','Emergency','Red') AND date(recordedDate) = ?`
    )
    .get(today);

  const highRiskPregnancies = db
    .prepare(
      `SELECT COUNT(*) as cnt FROM Condition WHERE riskCategory = 'HighRiskPregnancy' AND date(recordedDate) = ?`
    )
    .get(today);

  const recentReferrals = db
    .prepare(
      `SELECT c.id, c.patientId, c.riskCategory, c.note, c.recordedDate
       FROM Condition c WHERE c.riskCategory IN ('Critical','Emergency','Red','Yellow','HighRiskPregnancy')
       ORDER BY c.recordedDate DESC LIMIT 10`
    )
    .all();

  res.json({
    totalPatientsToday: patientsToday?.cnt ?? 0,
    criticalCases: criticalCases?.cnt ?? 0,
    highRiskPregnancies: highRiskPregnancies?.cnt ?? 0,
    recentReferrals: recentReferrals || [],
  });
});

module.exports = router;
