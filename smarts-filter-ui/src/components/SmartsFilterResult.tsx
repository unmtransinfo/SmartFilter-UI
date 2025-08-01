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
  const grouped = batch
    ? matchCounts.reduce((acc, item) => {
        const group = item.filterName || "Custom";
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      }, {} as Record<string, MatchResult[]>)
    : {};

  const [globalPage, setGlobalPage] = useState(1);
  const [globalRowsPerPage, setGlobalRowsPerPage] = useState(5);

  const [groupStates, setGroupStates] = useState(
    Object.keys(grouped).reduce((acc, key) => {
      acc[key] = { page: 1, rowsPerPage: 5 };
      return acc;
    }, {} as Record<string, { page: number; rowsPerPage: number }>)
  );

  const handleGroupPageChange = (key: string, direction: "next" | "prev") => {
    setGroupStates((prev) => {
      const total = Math.ceil(grouped[key].length / prev[key].rowsPerPage);
      const currentPage = prev[key].page;
      const nextPage = direction === "next" ? currentPage + 1 : currentPage - 1;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          page: Math.max(1, Math.min(nextPage, total)),
        },
      };
    });
  };

  const handleGroupRowsChange = (key: string, value: number) => {
    setGroupStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        rowsPerPage: value,
        page: 1,
      },
    }));
  };

  const handleGlobalPageChange = (direction: "next" | "prev") => {
    const totalPages = Math.ceil(matchCounts.length / globalRowsPerPage);
    const newPage = direction === "next" ? globalPage + 1 : globalPage - 1;
    setGlobalPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleGlobalRowsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlobalRowsPerPage(Number(e.target.value));
    setGlobalPage(1);
  };

  const openAnalyzeNewTab = (result: MatchResult) => {
    const key = `analyze_data_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem(key, JSON.stringify(result));
    const url = `/analyze?key=${key}`;
    window.open(url, "_blank");
  };

  if (matchCounts.length === 0) return null;

  return (
    <div className="container mt-4">
      <h3>Results ({matchCounts.length} molecules processed)</h3>

      {!batch && (
        <>
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
                {matchCounts
                  .slice(
                    (globalPage - 1) * globalRowsPerPage,
                    globalPage * globalRowsPerPage
                  )
                  .map((result, idx) => (
                    <tr
                      key={idx}
                      className={result.failed ? "table-danger" : "table-success"}
                    >
                      <td>{(globalPage - 1) * globalRowsPerPage + idx + 1}</td>
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

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-3">
            <div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleGlobalPageChange("prev")}
                disabled={globalPage === 1}
              >
                Previous
              </button>
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => handleGlobalPageChange("next")}
                disabled={globalPage * globalRowsPerPage >= matchCounts.length}
              >
                Next
              </button>
            </div>

            <div>
              Page {globalPage} of {Math.ceil(matchCounts.length / globalRowsPerPage)}
            </div>

            <div className="d-flex align-items-center gap-2">
              <label htmlFor="rowsPerPageSelect" className="mb-0">
                Show entries:
              </label>
              <select
                id="rowsPerPageSelect"
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={globalRowsPerPage}
                onChange={handleGlobalRowsChange}
              >
                {[5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {batch && (
        <>
          {Object.entries(grouped).map(([group, items], groupIdx) => {
            const { page, rowsPerPage } = groupStates[group] || {
              page: 1,
              rowsPerPage: 5,
            };
            const start = (page - 1) * rowsPerPage;
            const current = items.slice(start, start + rowsPerPage);
            const failedCount = items.filter((x) => x.failed).length;

            return (
              <details key={groupIdx} open className="mt-4">
                <summary>
                  {group} ({failedCount} hit{failedCount !== 1 ? "s" : ""})
                </summary>

                <div className="table-responsive mt-2">
                  <table className="table table-striped table-hover table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>#</th>
                        {view && <th>Structure</th>}
                        <th>Molecule Name</th>
                        <th>Result</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current.map((result, idx) => (
                        <tr
                          key={idx}
                          className={result.failed ? "table-danger" : "table-success"}
                        >
                          <td>{start + idx + 1}</td>
                          {view && (
                            <td>
                              <MolImage smiles={result.SMILES} />
                            </td>
                          )}
                          <td>{result.name}</td>
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

                <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-3">
                  <div>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => handleGroupPageChange(group, "prev")}
                      disabled={page === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="btn btn-outline-secondary ms-2"
                      onClick={() => handleGroupPageChange(group, "next")}
                      disabled={start + rowsPerPage >= items.length}
                    >
                      Next
                    </button>
                  </div>

                  <div>
                    Page {page} of {Math.ceil(items.length / rowsPerPage)}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <label htmlFor={`rows-${group}`} className="mb-0">
                      Show entries:
                    </label>
                    <select
                      id={`rows-${group}`}
                      className="form-select form-select-sm"
                      style={{ width: "auto" }}
                      value={rowsPerPage}
                      onChange={(e) =>
                        handleGroupRowsChange(group, Number(e.target.value))
                      }
                    >
                      {[5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
            );
          })}
        </>
      )}
    </div>
  );
};

export default SmartsFilterResult;
