const express = require("express");
const router = express.Router();
const { findUser } = require("../middleware/auth");

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = findUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      role: user.role,
    })
  ).toString("base64");
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

module.exports = router;
