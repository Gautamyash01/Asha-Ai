/**
 * Simple Role-Based Authentication Middleware
 * Roles: ASHA, Doctor, Admin
 */

const { getDb } = require("../db/schema");

// Demo users (in production, use proper password hashing)
const DEMO_USERS = [
  { id: "u1", username: "asha", password: "asha123", role: "ASHA" },
  { id: "u2", username: "doctor", password: "doctor123", role: "Doctor" },
  { id: "u3", username: "admin", password: "admin123", role: "Admin" },
];

function findUser(username, password) {
  return DEMO_USERS.find(
    (u) => u.username === username && u.password === password
  );
}

function requireRole(...allowed) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!allowed.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7);
    try {
      const payload = JSON.parse(Buffer.from(token, "base64").toString());
      req.user = payload;
      return next();
    } catch {}
  }
  req.user = null;
  next();
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = auth.slice(7);
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = {
  findUser,
  requireRole,
  requireAuth,
  optionalAuth,
  DEMO_USERS,
};
