import { useState } from "react";
import PatientForm from "./components/PatientForm";
import TriageCard from "./components/TriageCard";

function App() {
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <h1>ASHA AI Assistant</h1>
      <PatientForm setResult={setResult} />
      <TriageCard result={result} />
    </div>
  );
}

export default App;