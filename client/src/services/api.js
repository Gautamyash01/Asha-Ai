import axios from "axios";

const BASE = "http://localhost:5050";

export const runTriage = async (data) => {
  try {
    return await axios.post(`${BASE}/triage`, data);
  } catch (err) {
    throw err;
  }
};

export const getSummary = async (data, format = "json") => {
  const res = await axios.post(`${BASE}/triage/summary?format=${format}`, data);
  return res.data;
};

export const login = async (username, password) => {
  const res = await axios.post(`${BASE}/auth/login`, { username, password });
  return res.data;
};

export const getAdminStats = async (token) => {
  const res = await axios.get(`${BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPatient = async (data, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.post(`${BASE}/patients`, data, { headers });
  return res.data;
};

export const syncData = async (items) => {
  const res = await axios.post(`${BASE}/sync`, { items });
  return res.data;
};
