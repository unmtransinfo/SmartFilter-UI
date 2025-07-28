import React from "react";
import logo from "../assets/smartfilter_logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import InputData from "./InputData";
import { AppMode, RunMode } from "../App";

type SmartFilterLayoutProps = {
  mode: AppMode;
  setMode: React.Dispatch<React.SetStateAction<AppMode>>;
  runmode: RunMode;
  setRunmode: React.Dispatch<React.SetStateAction<RunMode>>;
  onSubmit: (inputData: any) => void;
  setBatch: React.Dispatch<React.SetStateAction<boolean>>;
  setView: React.Dispatch<React.SetStateAction<boolean>>;
  setDepict: React.Dispatch<React.SetStateAction<boolean>>;
  setPainsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  view: boolean; // ✅ Add this
  depict: boolean; // ✅ Add this
  children: React.ReactNode;
};

const SmartFilterLayout: React.FC<SmartFilterLayoutProps> = ({
  mode,
  setMode,
  runmode,
  setRunmode,
  onSubmit,
  setBatch,
  setView,
  setDepict,
  setPainsChecked,
  view, // ✅ Destructure here
  depict, // ✅ Destructure here
  children,
}) => {
  return (
    <div className="container-fluid p-3">
      {/* Top Bar */}
      <div className="row align-items-center mb-4 border-bottom pb-2">
        <div className="col-md-3 text-start">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="modeSwitch"
              checked={mode === "expert"}
              onChange={(e) => setMode(e.target.checked ? "expert" : "normal")}
            />
            <label className="form-check-label" htmlFor="modeSwitch">
              {mode === "expert" ? "Expert" : "Normal"}
            </label>
          </div>
        </div>
        <div className="col-md-6 text-center">
          <span className="fs-4 fw-bold">SmartFilter</span>
        </div>
        <div className="col-md-3 text-end">
          <button className="btn btn-outline-secondary btn-sm mx-1">Help</button>
          <button className="btn btn-outline-info btn-sm mx-1">Demo</button>
          <button className="btn btn-outline-danger btn-sm mx-1">Reset</button>
        </div>
      </div>

      {/* Input and Config */}
      <div className="row g-4 mb-4">
        <div className="col-md-8">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">Input Data</div>
            <div className="card-body">
              <InputData onSubmit={onSubmit} showSmarts={mode === "expert"} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">Configuration</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Run Mode</label>
                <select
                  value={runmode}
                  onChange={(e) => setRunmode(e.target.value as RunMode)}
                  className="form-select form-select-sm"
                >
                  <option value="filter">Filter</option>
                  <option value="analyze1mol">Analyze One Molecule</option>
                </select>
              </div>

              <div className="row">
                <div className="col-6">
                  <h6>Input</h6>
                  <div className="mb-2">
                    <label className="form-label">Format</label>
                    <select className="form-select form-select-sm">
                      <option>svg</option>
                      <option>png</option>
                      <option>jpg</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Delimiter</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder=","
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">SMILES Col</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Name Col</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
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
                  <div className="form-check mb-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="depictCheck"
                      checked={depict}
                      onChange={(e) => setDepict(e.target.checked)}
                      disabled={!view} // ✅ Only enabled if view is on
                    />
                    <label className="form-check-label" htmlFor="depictCheck">
                      Depict (Highlight Matches)
                    </label>
                  </div>

                  {mode === "expert" && (
                    <>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="showMatch"
                        />
                        <label className="form-check-label" htmlFor="showMatch">
                          Show Matches
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="passCheck"
                        />
                        <label className="form-check-label" htmlFor="passCheck">
                          Include Passes
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="failCheck"
                        />
                        <label className="form-check-label" htmlFor="failCheck">
                          Include Fails
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="headerCheck"
                        />
                        <label className="form-check-label" htmlFor="headerCheck">
                          Has Header
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="excludeMol"
                        />
                        <label className="form-check-label" htmlFor="excludeMol">
                          Exclude MolProps
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="strictCheck"
                        />
                        <label className="form-check-label" htmlFor="strictCheck">
                          Strict Mode
                        </label>
                      </div>
                      <div className="form-check mb-1">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="uniqueAtoms"
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

      {/* Children (results) */}
      {children}
    </div>
  );
};

export default SmartFilterLayout;
