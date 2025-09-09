// components/ModeSelector.tsx
import React from "react";

type ModeSelectorProps = {
  mode: "filter" | "analyze";
  onModeChange: (mode: "filter" | "analyze") => void;
};

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex space-x-4 items-center">
      <label className="text-lg font-medium">Mode:</label>
      <select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as "filter" | "analyze")}
        className="border px-3 py-1 rounded"
      >
        <option value="filter">Filter (1 SMARTS)</option>
        <option value="analyze">Analyze (multi-SMARTS)</option>
      </select>
    </div>
  );
};

export default ModeSelector;
