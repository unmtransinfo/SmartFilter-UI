import React, { useState } from "react";
import "../styles/InputData.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://chiltepin.health.unm.edu/smartsfilter/api/v1";

const SMARTS_PRESETS = [
  { label: "Select a SMARTS preset...", value: "" },
  { label: "UNM Reactive", value: "unm_reactive.sma" },
  { label: "Blake Filters", value: "lint_blake-v2.sma" },
  { label: "Oprea Filters", value: "oprea_filters.sma" },
  { label: "Alarm NMR", value: "alarmnmr.sma" },
  { label: "Glaxo Acids", value: "glaxo_acids.sma" },
  { label: "Glaxo Bases", value: "glaxo_bases.sma" },
  { label: "Glaxo Electrophile", value: "glaxo_electrophile.sma" },
  { label: "Glaxo Nucleophile", value: "glaxo_nucleophile.sma" },
  { label: "Glaxo Reactive", value: "glaxo_reactive.sma" },
  { label: "Glaxo Unsuitable Leads", value: "glaxo_unsuitable_leads.sma" },
  { label: "Glaxo Unsuitable NatProd", value: "glaxo_unsuitable_natprod.sma" },
];

const InputData = ({
  smilesText,
  setSmilesText,
  smartsText,
  setSmartsText,
  presetFilters,
  setPresetFilters,
  onSubmit,
  showSmarts = true,
  onFilterChange,
  delimiter,
  smileCol,
  nameCol,
}: {
  smilesText: string;
  setSmilesText: React.Dispatch<React.SetStateAction<string>>;
  smartsText: string;
  setSmartsText: React.Dispatch<React.SetStateAction<string>>;
  presetFilters: string[];
  setPresetFilters: React.Dispatch<React.SetStateAction<string[]>>;
  onSubmit: any;
  showSmarts?: boolean;
  onFilterChange?: (filters: string[]) => void;
  delimiter: string;
  smileCol: number;
  nameCol: number;
}) => {
  const smilesFileInput = React.useRef<HTMLInputElement>(null);
  const smartsFileInput = React.useRef<HTMLInputElement>(null);
  const [loadingPreset, setLoadingPreset] = useState(false);

  const presets = ["Pains", "Blake", "Glaxo", "Oprea", "Alarm NMR"];

  const handleLoadSmartsPreset = async (fileName: string) => {
    if (!fileName) return;
    setLoadingPreset(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/load_smarts/load?file_name=${encodeURIComponent(fileName)}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        alert(`Failed to load SMARTS: ${err.error || res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data.content) {
        setSmartsText(data.content);
      }
    } catch (err) {
      alert(`Failed to load SMARTS preset: ${(err as Error).message}`);
    } finally {
      setLoadingPreset(false);
    }
  };

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
        if (
          showSmarts &&
          !presetFilters.length &&
          !smartsText.trim()
        ) {
          alert(
            "Please provide SMARTS input or select at least one filter."
          );
          return;
        }
        onSubmit({
          smiles: { type: "text", content: smilesText },
          smarts: showSmarts && smartsText.trim()
            ? { type: "text", content: smartsText }
            : null,
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

        {/* Filter Checkbox Card */}
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
            <div className="input-card">
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => smartsFileInput.current?.click()}
                  className="btn-upload"
                >
                  Upload
                </button>
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 220 }}
                  defaultValue=""
                  disabled={loadingPreset}
                  onChange={(e) => handleLoadSmartsPreset(e.target.value)}
                >
                  {SMARTS_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {loadingPreset ? "Loading..." : p.label}
                    </option>
                  ))}
                </select>
              </div>
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
            </div>
        )}
        </div>

        {/* SMARTS Input Card (Expert Mode) */}
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
