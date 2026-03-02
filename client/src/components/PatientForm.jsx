import { useState } from "react";
import { runTriage } from "../services/api";

const PatientForm = ({ setResult }) => {
  const [form, setForm] = useState({
    bp: "",
    hemoglobin: "",
    pregnant: false,
  });

  const handleSubmit = async () => {
    const res = await runTriage(form);
    setResult(res.data);
  };

  return (
    <div>
      <input
        placeholder="BP"
        onChange={(e) => setForm({ ...form, bp: e.target.value })}
      />

      <input
        placeholder="Hemoglobin"
        onChange={(e) =>
          setForm({ ...form, hemoglobin: e.target.value })
        }
      />

      <label>
        Pregnant
        <input
          type="checkbox"
          onChange={(e) =>
            setForm({ ...form, pregnant: e.target.checked })
          }
        />
      </label>

      <br />

      <button onClick={handleSubmit}>Run Triage</button>
    </div>
  );
};

export default PatientForm;