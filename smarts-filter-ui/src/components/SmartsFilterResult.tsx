import React, { useState } from "react";
import { MatchResult } from "../HomePage";
import MolImage from "./MolImage";

interface SmartsFilterResultProps {
  matchCounts: MatchResult[];
  mode: string;
  totalMatched: number;
  batch: boolean;
  view: boolean;
}

const SmartsFilterResult: React.FC<SmartsFilterResultProps> = ({
  matchCounts,
  batch,
  view,
}) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (matchCounts.length === 0) return null;

  const totalPages = Math.ceil(matchCounts.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentResults = matchCounts.slice(startIndex, startIndex + rowsPerPage);

  // Handlers
  const handlePrev = () => {
    setCurrentPage((p) => (p > 1 ? p - 1 : p));
  };

  const handleNext = () => {
    setCurrentPage((p) => (p < totalPages ? p + 1 : p));
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Open analyze page in new tab, save data in sessionStorage
  const openAnalyzeNewTab = (result: MatchResult) => {
    const key = `analyze_data_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem(key, JSON.stringify(result));
    const url = `/analyze?key=${key}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mt-4">
      <h3>Results ({matchCounts.length} molecules processed)</h3>

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Name</th>
              {view && <th>Structure</th>}
              <th>Filter</th>
              <th>Result</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentResults.map((result, idx) => (
              <tr
                key={startIndex + idx}
                className={result.failed ? "table-danger" : "table-success"}
              >
                <td>{startIndex + idx + 1}</td>
                <td>{result.name}</td>
                {view && (
                  <td>
                    <MolImage smiles={result.SMILES} />
                  </td>
                )}
                <td>{result.filterName || "Custom"}</td>
                <td>{result.failed ? "Fail" : "Pass"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => openAnalyzeNewTab(result)}
                  >
                    Analyze
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
        <div>
          <button
            className="btn btn-outline-secondary"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div>
          Page {currentPage} of {totalPages}
        </div>

        <div className="d-flex align-items-center gap-2">
          <label htmlFor="rowsPerPageSelect" className="mb-0">
            Show entries:
          </label>
          <select
            id="rowsPerPageSelect"
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            {[5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SmartsFilterResult;
