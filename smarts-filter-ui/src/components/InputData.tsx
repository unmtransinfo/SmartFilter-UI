import React, { useRef, useState } from "react";
import "../styles/InputData.css"; // We'll create this CSS file below

const InputData = ({
  onSubmit,
  showSmarts = true,
  onFilterChange,
  delimiter,
  smileCol,
  nameCol,
}: {
  onSubmit: any;
  showSmarts?: boolean;
  onFilterChange?: (filters: string[]) => void;
  delimiter: string;
  smileCol: number;
  nameCol: number;
}) => {
  const [smilesText, setSmilesText] = useState("");
  const [smartsText, setSmartsText] = useState("");
  const [presetFilters, setPresetFilters] = useState<string[]>([]);

  const smilesFileInput = useRef<HTMLInputElement>(null);
  const smartsFileInput = useRef<HTMLInputElement>(null);

  const presets = ["Pains", "Blake", "Glaxo", "Oprea", "Alarm NMR"];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setter(text);
      }
    };
    reader.readAsText(file);
  };

  const handlePresetChange = (preset: string) => {
    setPresetFilters((prev) => {
      let newFilters;
      if (prev.includes(preset)) {
        newFilters = prev.filter((p) => p !== preset);
      } else {
        newFilters = [...prev, preset];
      }
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
      return newFilters;
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!smilesText.trim()) {
          alert("Please provide SMILES data.");
          return;
        }
        if (showSmarts && !smartsText.trim() && presetFilters.length === 0) {
          alert("Please provide SMARTS or select a filter.");
          return;
        }
        onSubmit({
          smiles: { type: "text", content: smilesText },
          smarts: showSmarts ? { type: "text", content: smartsText } : null,
          filters: presetFilters,
          delimiter,
          smileCol,
          nameCol,
        });
      }}
      className="input-form"
    >
      <div className="input-container">
        {/* SMILES Input Card */}
        <div className="input-card">
          <label className="input-label">SMILES Input:</label>
          <button
            type="button"
            onClick={() => smilesFileInput.current?.click()}
            className="btn-upload"
          >
            Upload
          </button>
          <input
            type="file"
            accept=".smi,.txt"
            ref={smilesFileInput}
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e, setSmilesText)}
          />
          <textarea
            rows={8}
            value={smilesText}
            onChange={(e) => setSmilesText(e.target.value)}
            placeholder="Paste SMILES here or upload a file above"
            className="input-textarea"
          />
        </div>

        {/* SMARTS Input and Filter Card */}
        <div className="input-card">
          <label className="input-label">Select SMART Filters:</label>
          <div className="preset-filters">
            {presets.map((p) => (
              <div className="form-check form-check-inline" key={p}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`preset-${p}`}
                  checked={presetFilters.includes(p)}
                  onChange={() => handlePresetChange(p)}
                />
                <label className="form-check-label" htmlFor={`preset-${p}`}>
                  {p}
                </label>
              </div>
            ))}
          </div>

          {showSmarts && (
            <>
              <hr className="divider" />
              <label className="input-label">SMARTS Input:</label>
              <button
                type="button"
                onClick={() => smartsFileInput.current?.click()}
                className="btn-upload"
              >
                Upload
              </button>
              <input
                type="file"
                accept=".smi,.txt,.sma,.smarts"
                ref={smartsFileInput}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e, setSmartsText)}
              />
              <textarea
                rows={8}
                value={smartsText}
                onChange={(e) => setSmartsText(e.target.value)}
                placeholder="Paste SMARTS here or upload a file above"
                className="input-textarea"
              />
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="submit" className="btn-submit">
          FILTER
        </button>
      </div>
    </form>
  );
};

export default InputData;
