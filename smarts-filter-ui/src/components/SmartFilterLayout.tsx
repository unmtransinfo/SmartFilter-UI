import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import InputData from "./InputData";
import { AppMode, RunMode } from "../HomePage";
import "../styles/SmartFilterLayout.css";

type SmartFilterLayoutProps = {
  mode: AppMode;
  setMode: React.Dispatch<React.SetStateAction<AppMode>>;
  runmode: RunMode;
  setRunmode: React.Dispatch<React.SetStateAction<RunMode>>;
  onSubmit: (inputData: any) => void;
  setBatch: React.Dispatch<React.SetStateAction<boolean>>;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
  setPainsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  batch: boolean;
  view: boolean;
  children: React.ReactNode;
};

const SmartFilterLayout: React.FC<SmartFilterLayoutProps> = ({
  mode,
  setMode,
  onSubmit,
  setBatch,
  setView,
  setPainsChecked,
  batch,
  view,
  children,
}) => {
  const [delimiter, setDelimiter] = useState<string>("' '");
  const [smileCol, setSmileCol] = useState<number>(0);
  const [nameCol, setNameCol] = useState<number>(1);

  // Lifted states for controlled inputs
  const [smilesText, setSmilesText] = useState<string>("");
  const [smartsText, setSmartsText] = useState("");
  const [presetFilters, setPresetFilters] = useState<string[]>([]);

  const fetchDemoSmiles = async (): Promise<{ smiles: string; name: string }[]> => {
    try {
      const response = await fetch('/data/demo.smi');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => {
        const [smiles, ...nameParts] = line.trim().split(/\s+/);
        return { smiles, name: nameParts.join(' ') || 'Unnamed' };
      });
    } catch (err) {
      console.error('Failed to fetch demo.smi:', err);
      return [];
    }
  };

  const handleDemoClick = async () => {
    setPainsChecked(true);
    setBatch(true);
    setView(true);

    const demoData = await fetchDemoSmiles();
    const demoSmilesText = demoData.map(({ smiles, name }) => `${smiles} ${name}`).join('\n');

    setSmilesText(demoSmilesText);      
    setPresetFilters(["Pains"]);     

    onSubmit({
      smiles: { type: "text", content: demoSmilesText },
      smarts: null,
      filters: ["Pains"],
      delimiter,
      smileCol,
      nameCol,
    });
  };

  return (
    <div className={`container-fluid p-3 ${mode === "expert" ? "expert-mode" : ""}`}>
      {/* Top Bar */}
      <div className="row align-items-center mb-4 border-bottom pb-2 top-bar">
        <div className="col-md-3 text-start">
          <div className="form-check form-switch mode-toggle">
            <input
              className="form-check-input"
              type="checkbox"
              id="modeSwitch"
              checked={mode === "expert"}
              onChange={(e) => setMode(e.target.checked ? "expert" : "normal")}
            />
            <label className="form-check-label fw-semibold" htmlFor="modeSwitch">
              {mode === "expert" ? "Expert" : "Normal"}
            </label>
          </div>
        </div>
        <div className="col-md-6 text-center">
          <img src="/filter.png" alt="logo" width={60}/>
          <span className="fs-4 fw-bold logo-title">SmartFilter</span>
        </div>
        <div className="col-md-3 text-end">
          <button className="btn btn-outline-secondary btn-sm mx-1">Help</button>
          <button className="btn btn-outline-info btn-sm mx-1" onClick={handleDemoClick}>
            Demo
          </button>
          <button
            className="btn btn-outline-danger btn-sm mx-1"
            onClick={() => window.location.reload()}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Input and Config */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">Input Data</div>
            <div className="card-body">
            <InputData
              smilesText={smilesText}
              setSmilesText={setSmilesText}
              smartsText={smartsText}
              setSmartsText={setSmartsText}
              presetFilters={presetFilters}
              setPresetFilters={setPresetFilters}
              onSubmit={onSubmit}
              showSmarts={mode === "expert"}
              delimiter={delimiter}
              smileCol={smileCol}
              nameCol={nameCol}
            />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">Configuration</div>
            <div className="card-body">
              <div className="row">
                <div className="col-6">
                  <h6>Input</h6>
                  <div className="mb-2">
                    <label className="form-label">Delimiter</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="' ' or ','"
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">SMILES Col</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={smileCol}
                      onChange={(e) => setSmileCol(Number(e.target.value))}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Name Col</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={nameCol}
                      onChange={(e) => setNameCol(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="col-1 border-start"></div>

                <div className="col-5">
                  <h6>Output</h6>
                  <div className="form-check mb-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="batchCheck"
                      checked={batch}
                      onChange={(e) => setBatch(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="batchCheck">
                      Batch
                    </label>
                  </div>
                  <div className="form-check mb-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="viewCheck"
                      checked={view}
                      onChange={(e) => setView(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="viewCheck">
                      View
                    </label>
                  </div>

                    {mode === "expert" && (
                      <>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="showMatch" />
                          <label className="form-check-label" htmlFor="showMatch">
                            Show Matches
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="passCheck" />
                          <label className="form-check-label" htmlFor="passCheck">
                            Include Passes
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="failCheck" />
                          <label className="form-check-label" htmlFor="failCheck">
                            Include Fails
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="headerCheck" />
                          <label className="form-check-label" htmlFor="headerCheck">
                            Has Header
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="excludeMol" />
                          <label className="form-check-label" htmlFor="excludeMol">
                            Exclude MolProps
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="strictCheck" />
                          <label className="form-check-label" htmlFor="strictCheck">
                            Strict Mode
                          </label>
                        </div>
                        <div className="form-check mb-1">
                          <input className="form-check-input" type="checkbox" id="uniqueAtoms" />
                          <label className="form-check-label" htmlFor="uniqueAtoms">
                            Unique Atoms
                          </label>
                        </div>
                      </>
                    )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

export default SmartFilterLayout;
