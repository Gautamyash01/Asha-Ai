const axios = require("axios");

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

async function predictRiskFromMl(payload) {
  const url = `${ML_BASE_URL}/predict-risk`;

  const response = await axios.post(url, payload, {
    timeout: 5000,
  });

  return response.data;
}

module.exports = {
  predictRiskFromMl,
};

