const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const { bp, hemoglobin, pregnant } = req.body;

  let level = "LOW";
  let action = "Home care";

  if (pregnant && bp > 140) {
    level = "HIGH";
    action = "Refer to PHC within 24 hours";
  }

  if (hemoglobin && hemoglobin < 9) {
    level = "HIGH";
    action = "Immediate medical attention required";
  }

  res.json({ level, action });
});

module.exports = router;