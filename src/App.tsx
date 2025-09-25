import { HashRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage"; // Main filtering UI
import AnalyzePage from "./components/AnalyzeMoleculePage"; // Full molecule analysis view

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;