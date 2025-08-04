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
  includePasses: boolean;
  setIncludePasses: React.Dispatch<React.SetStateAction<boolean>>;
  includeFails: boolean;
  setIncludeFails: React.Dispatch<React.SetStateAction<boolean>>;
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
  includePasses,
  setIncludePasses,
  includeFails,
  setIncludeFails,
  children,
}) => {
  const [delimiter, setDelimiter] = useState<string>("' '");
  const [smileCol, setSmileCol] = useState<number>(0);
  const [nameCol, setNameCol] = useState<number>(1);

  const [smilesText, setSmilesText] = useState<string>("");
  const [smartsText, setSmartsText] = useState("");
  const [presetFilters, setPresetFilters] = useState<string[]>([]);

  // Expert mode configs
  const [hasHeader, setHasHeader] = useState(false);
  const [excludeMolProps, setExcludeMolProps] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [uniqueAtoms, setUniqueAtoms] = useState(false);

  // New expert mode input checkboxes
  const [useKekule, setUseKekule] = useState(false);
  const [useIsomeric, setUseIsomeric] = useState(false);

  const fetchDemoSmiles = async (): Promise<{ smiles: string; name: string }[]> => {
    try {
      const response = await fetch("/data/demo.smi");
      const text = await response.text();
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      return lines.map((line) => {
        const [smiles, ...nameParts] = line.trim().split(/\s+/);
        return { smiles, name: nameParts.join(" ") || "Unnamed" };
      });
    } catch (err) {
      console.error("Failed to fetch demo.smi:", err);
      return [];
    }
  };

  const handleDemoClick = async () => {
    setPainsChecked(true);
    setBatch(true);
    setView(true);

    const demoData = await fetchDemoSmiles();
    const demoSmilesText = demoData
      .map(({ smiles, name }) => `${smiles} ${name}`)
      .join("\n");

    setSmilesText(demoSmilesText);
    setPresetFilters(["Pains"]);

    onSubmit({
      smiles: { type: "text", content: demoSmilesText },
      smarts: null,
      filters: ["Pains"],
      delimiter,
      smileCol,
      nameCol,
      config: {
        hasHeader,
        excludeMolProps,
        strictMode,
        uniqueAtoms,
        useKekule,
        useIsomeric,
      },
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
          <img src="/filter.png" alt="logo" width={60} />
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

                  {/* Small inline checkboxes for Delim, Smile Col, Name Col */}
                  <div className="mb-2 d-flex align-items-center gap-2">
                    <label className="form-label mb-0" htmlFor="delimiterInput" style={{ minWidth: 60 }}>
                      Delimiter
                    </label>
                    <input
                      id="delimiterInput"
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="' ' or ','"
                      value={delimiter}
                      onChange={(e) => setDelimiter(e.target.value)}
                      style={{ maxWidth: 80 }}
                    />
                  </div>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <label className="form-label mb-0" htmlFor="smileColInput" style={{ minWidth: 60 }}>
                      SMILES Col
                    </label>
                    <input
                      id="smileColInput"
                      type="number"
                      className="form-control form-control-sm"
                      value={smileCol}
                      onChange={(e) => setSmileCol(Number(e.target.value))}
                      style={{ maxWidth: 80 }}
                    />
                  </div>

                  <div className="mb-2 d-flex align-items-center gap-2">
                    <label className="form-label mb-0" htmlFor="nameColInput" style={{ minWidth: 60 }}>
                      Name Col
                    </label>
                    <input
                      id="nameColInput"
                      type="number"
                      className="form-control form-control-sm"
                      value={nameCol}
                      onChange={(e) => setNameCol(Number(e.target.value))}
                      style={{ maxWidth: 80 }}
                    />
                  </div>

                  {/* Has Header checkbox moved here for all modes */}
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="headerCheck"
                      checked={hasHeader}
                      onChange={(e) => setHasHeader(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="headerCheck">
                      Has Header
                    </label>
                  </div>

                  {/* Kekule and Isomeric SMILES checkboxes - expert only */}
                  {mode === "expert" && (
                    <>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="kekuleCheck"
                          checked={useKekule}
                          onChange={(e) => setUseKekule(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="kekuleCheck">
                          Kekule
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="isomericCheck"
                          checked={useIsomeric}
                          onChange={(e) => setUseIsomeric(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="isomericCheck">
                          Isomeric
                        </label>
                      </div>
                    </>
                  )}
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
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="passCheck"
                          checked={includePasses}
                          onChange={(e) => setIncludePasses(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="passCheck">
                          Include Passes
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="failCheck"
                          checked={includeFails}
                          onChange={(e) => setIncludeFails(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="failCheck">
                          Include Fails
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="excludeMol"
                          checked={excludeMolProps}
                          onChange={(e) => setExcludeMolProps(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="excludeMol">
                          Exclude MolProps
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="strictCheck"
                          checked={strictMode}
                          onChange={(e) => setStrictMode(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="strictCheck">
                          Strict Mode
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="uniqueAtoms"
                          checked={uniqueAtoms}
                          onChange={(e) => setUniqueAtoms(e.target.checked)}
                        />
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
