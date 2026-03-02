const express = require("express");
const cors = require("cors");

const triageRoutes = require("./routes/triageRoutes");

const app = express();

app.use(cors());              // ✅ this alone is enough
app.use(express.json());

app.use("/triage", triageRoutes);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(5050, () => {
  console.log("Server running on port 5050");
});