// SmartFilterLayout.tsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import InputData from "./InputData";
import { AppMode, RunMode } from "../App";

type SmartFilterLayoutProps = {
  mode: AppMode;
  setMode: React.Dispatch<React.SetStateAction<AppMode>>;
  runmode: RunMode;
  setRunmode: React.Dispatch<React.SetStateAction<RunMode>>;
  onSubmit: (inputData: any) => void;
  children: React.ReactNode;
};

const SmartFilterLayout: React.FC<SmartFilterLayoutProps> = ({
  mode,
  setMode,
  runmode,
  setRunmode,
  onSubmit,
  children,
}) => {
  return (
    <div className="container-fluid p-3">
      {/* Top Bar */}
      <div className="row align-items-center mb-4 border-bottom pb-2">
        <div className="col-md-3 text-start">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as AppMode)}
            className="form-select form-select-sm w-50"
          >
            <option value="normal">Normal</option>
            <option value="expert">Expert</option>
          </select>
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

      {/* Input + Config Section */}
      <div className="row g-4 mb-4">
        {/* SMILES + SMARTS Form (wrapped together) */}
        <div className="col-md-8">
          <div className="border p-3 rounded bg-light shadow-sm">
            <InputData onSubmit={onSubmit} />
          </div>
        </div>

        {/* Config Box */}
        <div className="col-md-4">
          <div className="border p-3 rounded bg-light shadow-sm">
            <h6>Input & Output Configuration</h6>
            <div className="mb-2">
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

            <div className="mb-2">
              <label className="form-label">Format</label>
              <select className="form-select form-select-sm">
                <option>svg</option>
                <option>png</option>
                <option>jpg</option>
              </select>
            </div>

            <hr />

            <div className="mb-2">
              <label className="form-label">Delimiter</label>
              <input type="text" className="form-control form-control-sm" placeholder="," />
            </div>
            <div className="mb-2">
              <label className="form-label">SMILES column index</label>
              <input type="number" className="form-control form-control-sm" />
            </div>
            <div className="mb-2">
              <label className="form-label">Name column index (optional)</label>
              <input type="number" className="form-control form-control-sm" />
            </div>

            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="headerCheck" />
              <label className="form-check-label" htmlFor="headerCheck">
                Has Header
              </label>
            </div>
            <div className="form-check mb-2">
              <input type="checkbox" className="form-check-input" id="excludeMol" />
              <label className="form-check-label" htmlFor="excludeMol">
                Exclude MolProps
              </label>
            </div>

            <hr />

            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="batchCheck" />
              <label className="form-check-label" htmlFor="batchCheck">
                Batch
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="passCheck" />
              <label className="form-check-label" htmlFor="passCheck">
                Include Passes
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="failCheck" />
              <label className="form-check-label" htmlFor="failCheck">
                Include Fails
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="uniqueAtoms" />
              <label className="form-check-label" htmlFor="uniqueAtoms">
                Unique Atoms
              </label>
            </div>
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="strictCheck" />
              <label className="form-check-label" htmlFor="strictCheck">
                Strict Mode
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Render children below inputs */}
      {children}
    </div>
  );
};

export default SmartFilterLayout;