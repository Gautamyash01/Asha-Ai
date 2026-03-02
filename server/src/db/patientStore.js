/**
 * Patient and encounter storage - FHIR-aligned
 */

const { getDb } = require("./schema");
const { randomUUID } = require("crypto");

function createPatient(data) {
  const id = data.id || randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT OR REPLACE INTO Patient (id, name, gender, birthDate, updatedAt)
     VALUES (?, ?, ?, ?, datetime('now'))`
  ).run(id, data.name ?? null, data.gender ?? null, data.birthDate ?? null);
  return id;
}

function createEncounter(patientId, data = {}) {
  const id = data.id || randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO Encounter (id, patientId, status, class, practitionerId)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, patientId, data.status ?? "in-progress", "AMB", data.practitionerId ?? null);
  return id;
}

function createObservation(data) {
  const id = data.id || randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO Observation (id, encounterId, patientId, code, valueQuantity, valueString, valueBoolean, unit)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.encounterId ?? null,
    data.patientId,
    data.code,
    data.valueQuantity ?? null,
    data.valueString ?? null,
    data.valueBoolean ?? null,
    data.unit ?? null
  );
  return id;
}

function createCondition(data) {
  const id = data.id || randomUUID();
  const db = getDb();
  db.prepare(
    `INSERT INTO Condition (id, patientId, encounterId, code, riskCategory, riskProbability, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.patientId,
    data.encounterId ?? null,
    data.code ?? "risk",
    data.riskCategory ?? null,
    data.riskProbability ?? null,
    data.note ?? null
  );
  return id;
}

function saveTriageToDb(patientId, encounterId, vitals, triageResult) {
  const db = getDb();
  const vitalsMap = [
    ["systolicBP", vitals.systolicBP, "mmHg"],
    ["diastolicBP", vitals.diastolicBP, "mmHg"],
    ["bloodSugar", vitals.bloodSugar, "mg/dL"],
    ["temperature", vitals.temperature, "Cel"],
    ["spo2", vitals.spo2, "%"],
    ["heartRate", vitals.heartRate, "/min"],
    ["hemoglobin", vitals.hemoglobin, "g/dL"],
  ];
  for (const [code, val, unit] of vitalsMap) {
    if (val != null) {
      createObservation({
        encounterId,
        patientId,
        code,
        valueQuantity: val,
        unit,
      });
    }
  }
  createCondition({
    patientId,
    encounterId,
    code: "triage",
    riskCategory: triageResult.riskCategory ?? triageResult.riskLabel,
    riskProbability: triageResult.riskProbability,
    note: triageResult.recommendedAction,
  });
}

module.exports = {
  createPatient,
  createEncounter,
  createObservation,
  createCondition,
  saveTriageToDb,
};
