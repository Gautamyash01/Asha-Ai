const express = require("express");
const router = express.Router();
const { getDb } = require("../db/schema");

/**
 * Sync endpoint placeholder - for offline-first.
 * Client stores data locally; this endpoint would receive batched updates
 * when back online. Not fully implemented.
 */
router.post("/", (req, res) => {
  const items = req.body?.items || [];
  const db = getDb();
  let processed = 0;
  for (const item of items) {
    try {
      const stmt = db.prepare(
        `INSERT INTO SyncQueue (entityType, entityId, payload, action) VALUES (?, ?, ?, ?)`
      );
      stmt.run(
        item.entityType || "unknown",
        item.entityId || null,
        JSON.stringify(item.payload || {}),
        item.action || "create"
      );
      processed++;
    } catch (e) {
      console.warn("Sync item error:", e.message);
    }
  }
  res.json({ received: items.length, processed });
});

router.get("/status", (req, res) => {
  res.json({ status: "ok", message: "Sync endpoint available" });
});

module.exports = router;
