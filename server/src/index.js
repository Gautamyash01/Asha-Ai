const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const triageRoutes = require("./routes/triageRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const syncRoutes = require("./routes/syncRoutes");
const patientRoutes = require("./routes/patientRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Ensure data dirs exist
const dataDir = path.join(__dirname, "..", "data");
const modelsDir = path.join(__dirname, "..", "models");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

app.use("/triage", triageRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sync", syncRoutes);
app.use("/patients", patientRoutes);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", offlineReady: true });
});

app.listen(5050, () => {
  console.log("Server running on port 5050");
});
