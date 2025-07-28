import React from "react";
import { MatchResult } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";
import MolImage from "./MolImage";

interface SmartsFilterResultProps {
  matchCounts: MatchResult[];
  mode: "filter" | "analyze1mol";
  totalMatched: number;
  batch?: boolean;
  view?: boolean;
  depict?: boolean;
}

const SmartsFilterResult: React.FC<SmartsFilterResultProps> = ({
  matchCounts,
  mode,
  totalMatched,
  batch = false,
  view = false,
  depict = false,
}) => {
  const downloadCSV = () => {
    const headers = ["Index", "Structure", "Molecule Name", "SMART Filter", "Result"];
    const rows = matchCounts.map((result, idx) => [
      idx + 1,
      result.SMILES,
      result.name,
      result.Smart || "",
      result.matched ? "Matched" : "Not Matched",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "smarts_filter_results.csv");
    link.click();
  };
  const sanitizeSmiles = (smiles: string) => smiles?.split(" ")[0].trim();
  return (
    <div className="card shadow-sm mt-3">
      <div className="card-header d-flex justify-content-between align-items-center bg-gradient bg-primary text-white">
        <span>Results ({totalMatched} molecules processed)</span>
        {mode === "filter" && (
          <button onClick={downloadCSV} className="btn btn-sm btn-outline-light">
            Download CSV
          </button>
        )}
      </div>

      <div className="card-body p-0">
        {mode === "filter" ? (
          <div className="table-responsive">
            <table className="table table-striped table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Structure</th>
                  <th>Molecule Name</th>
                  <th>SMART Filter</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {matchCounts.map((res, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      {view ? (
                      <MolImage
                        smiles={sanitizeSmiles(res.SMILES)}
                        format="svg"  // or "png" — format independent of depict
                        width={"100%"}
                        height={"auto"}
                        highlightAtoms={depict && res.highlightAtoms ? res.highlightAtoms : []}
                      />

                      ) : (
                        sanitizeSmiles(res.SMILES)
                      )}
                    </td>
                    <td>{res.name}</td>
                    <td>{res.Smart || ""}</td>
                    <td>
                      <span className={`badge ${res.matched ? "bg-danger" : "bg-success"}`}>
                        {res.matched ? "Fail" : "Pass"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-3">
            <h6>Total Processed: {totalMatched}</h6>
            <ul>
              {matchCounts.map((res, idx) => (
                <li key={idx}>
                  {res.name} ({res.SMILES}) - {res.matched ? "Matched" : "Not Matched"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartsFilterResult;
