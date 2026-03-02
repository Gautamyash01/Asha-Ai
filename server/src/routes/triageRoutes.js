const express = require("express");
const router = express.Router();
const { predictRiskFromMl } = require("../services/mlClient");

router.post("/", async (req, res) => {
  try {
    const {
      age,
      gender,
      pregnancy,
      systolic_bp,
      diastolic_bp,
      blood_sugar,
      temperature,
      spo2,
      heart_rate,
      symptoms,
    } = req.body;

    const mlPayload = {
      age,
      gender,
      pregnancy,
      systolic_bp,
      diastolic_bp,
      blood_sugar,
      temperature,
      spo2,
      heart_rate,
      symptoms: symptoms || [],
    };

    const mlResult = await predictRiskFromMl(mlPayload);

    return res.json(mlResult);
  } catch (err) {
    console.error("Error calling ML service:", err.message);
    return res.status(502).json({
      error: "Failed to get risk prediction from ML service",
    });
  }
});

module.exports = router;