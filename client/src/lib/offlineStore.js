/**
 * Offline-first local storage using IndexedDB (or localStorage fallback)
 */
const DB_NAME = "asha-local";
const STORE = "patients";

function getDb() {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function savePatientLocal(data) {
  const id = data.id || "p_" + Date.now();
  const record = { ...data, id };
  const db = await getDb();
  if (!db) {
    const key = "asha_patients";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push(record);
    localStorage.setItem(key, JSON.stringify(list));
    return id;
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve(id);
  });
}

export async function getPatientsLocal() {
  const db = await getDb();
  if (!db) {
    return JSON.parse(localStorage.getItem("asha_patients") || "[]");
  }
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}
