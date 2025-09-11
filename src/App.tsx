// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage"; // Main filtering UI
import AnalyzePage from "./components/AnalyzeMoleculePage"; // Full molecule analysis view

function App() {
  return (
    <Router basename="/smartsfilter">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
      </Routes>
    </Router>
  );
}

export default App;
