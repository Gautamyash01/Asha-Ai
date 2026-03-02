import { runTriage } from "../services/triageService.js";

export const triage = (req, res) => {
  const result = runTriage(req.body);
  res.json(result);
};