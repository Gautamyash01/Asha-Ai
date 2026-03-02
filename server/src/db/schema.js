/**
 * FHIR-Ready Database Schema
 * Structured entities: Patient, Observation, Condition, Encounter
 * Not a full FHIR server - schema aligned to FHIR concepts.
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "../../data/asha.db");

function initDb() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Patient (FHIR Patient-like)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Patient (
      id TEXT PRIMARY KEY,
      name TEXT,
      gender TEXT,
      birthDate TEXT,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Encounter (FHIR Encounter-like - visit/consultation)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Encounter (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      status TEXT DEFAULT 'in-progress',
      class TEXT DEFAULT 'AMB',
      startedAt TEXT DEFAULT (datetime('now')),
      endedAt TEXT,
      practitionerId TEXT,
      FOREIGN KEY (patientId) REFERENCES Patient(id)
    )
  `);

  // Observation (FHIR Observation-like - vitals, labs)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Observation (
      id TEXT PRIMARY KEY,
      encounterId TEXT,
      patientId TEXT NOT NULL,
      code TEXT,
      valueQuantity REAL,
      valueString TEXT,
      valueBoolean INTEGER,
      unit TEXT,
      issuedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (encounterId) REFERENCES Encounter(id),
      FOREIGN KEY (patientId) REFERENCES Patient(id)
    )
  `);

  // Condition (FHIR Condition-like - diagnoses, risk)
  db.exec(`
    CREATE TABLE IF NOT EXISTS Condition (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      encounterId TEXT,
      code TEXT,
      clinicalStatus TEXT DEFAULT 'active',
      verificationStatus TEXT DEFAULT 'confirmed',
      onsetDateTime TEXT,
      recordedDate TEXT DEFAULT (datetime('now')),
      note TEXT,
      riskCategory TEXT,
      riskProbability REAL,
      FOREIGN KEY (patientId) REFERENCES Patient(id),
      FOREIGN KEY (encounterId) REFERENCES Encounter(id)
    )
  `);

  // User (for auth)
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT,
      role TEXT NOT NULL CHECK(role IN ('ASHA','Doctor','Admin')),
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  // Sync queue (for offline-first)
  db.exec(`
    CREATE TABLE IF NOT EXISTS SyncQueue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT,
      entityId TEXT,
      payload TEXT,
      action TEXT,
      synced INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    )
  `);

  return db;
}

let db = null;

function getDb() {
  if (!db) {
    const fs = require("fs");
    const dataDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = initDb();
  }
  return db;
}

module.exports = { getDb, initDb, DB_PATH };
