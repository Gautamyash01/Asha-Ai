const express = require("express");
const router = express.Router();
const { getDb } = require("../db/schema");
const { createPatient, createEncounter } = require("../db/patientStore");
const { requireAuth, requireRole, optionalAuth } = require("../middleware/auth");
const { randomUUID } = require("crypto");

router.use(optionalAuth);

// ASHA can create patient entries
router.post("/", (req, res) => {
  const { name, gender, birthDate } = req.body || {};
  const id = randomUUID();
  createPatient({ id, name, gender, birthDate });
  res.json({ id, name, gender, birthDate });
});

// Doctor can see full summary history
router.get("/:id/summaries", requireAuth, requireRole("Doctor", "Admin"), (req, res) => {
  const db = getDb();
  const conditions = db
    .prepare(
      `SELECT id, riskCategory, riskProbability, note, recordedDate
       FROM Condition WHERE patientId = ? ORDER BY recordedDate DESC`
    )
    .all(req.params.id);
  const observations = db
    .prepare(
      `SELECT code, valueQuantity, unit, issuedAt FROM Observation WHERE patientId = ? ORDER BY issuedAt DESC`
    )
    .all(req.params.id);
  res.json({ conditions, observations });
});

module.exports = router;
