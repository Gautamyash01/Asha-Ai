import axios from "axios";

export const runTriage = async (data) => {
  return axios.post("http://localhost:5050/triage", data);
};