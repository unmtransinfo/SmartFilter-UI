import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MolImage from "./MolImage";
import initRDKitModule from "@rdkit/rdkit";

interface MatchDetail {
  name: string;
  SMILES: string;
  Smart: string;
  matched: boolean;
}

const AnalyzePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [RDKit, setRDKit] = useState<any>(null);
  const [results, setResults] = useState<MatchDetail[]>([]);
  const [molName, setMolName] = useState<string>("");
  const [molSmiles, setMolSmiles] = useState<string>("");
  const [highlightAtoms, setHighlightAtoms] = useState<number[]>([]);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        const RDKitModule = await initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm",
        });
        setRDKit(RDKitModule);
      } catch (err) {
        console.error("RDKit.js init failed", err);
      }
    };
    loadRDKit();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const key = searchParams.get("key");

    if (!key) {
      navigate("/");
      return;
    }

    const jsonData = sessionStorage.getItem(key);
    if (!jsonData) {
      navigate("/");
      return;
    }

    try {
      const state = JSON.parse(jsonData);
      setMolName(state.name);
      setMolSmiles(state.SMILES);
      setHighlightAtoms(state.highlightAtoms || []);

      if (state.all_pains_filters && state.matches) {
        const arr: MatchDetail[] = state.all_pains_filters.map(
          (patternName: string, idx: number) => ({
            name: state.name,
            SMILES: state.SMILES,
            Smart: patternName,
            matched: state.matches ? state.matches[idx] ?? false : false,
          })
        );
        setResults(arr);
      } else if (state.smart) {
        setResults([
          {
            name: state.name,
            SMILES: state.SMILES,
            Smart: state.smart,
            matched: false,
          },
        ]);
      } else {
        setResults([]);
      }
    } catch (e) {
      console.error("Failed to parse analyze data from sessionStorage", e);
      navigate("/");
    }
  }, [location.search, navigate]);

  const totalSmarts = results.length;
  const totalMatches = results.filter((r) => r.matched).length;

  return (
    <div className="container mt-4">
      <h3>Analysis of Molecule</h3>
      <p>
        <strong>Name:</strong> {molName}
      </p>
      <p>
        <strong>Result:</strong> {totalMatches > 0 ? "Fail" : "Pass"}
      </p>
      <p>
        <strong>Total SMARTS:</strong> {totalSmarts}
      </p>
      <p>
        <strong>Total Matches:</strong> {totalMatches}
      </p>

      <MolImage smiles={molSmiles} highlightAtoms={highlightAtoms} />

      <div className="table-responsive mt-4">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Match</th>
              <th>SMARTS Pattern</th>
            </tr>
          </thead>
          <tbody>
            {results.map((s, i) => (
              <tr
                key={i}
                className={s.matched ? "table-danger" : "table-success"}
              >
                <td>{i + 1}</td>
                <td>{s.matched ? "Fail" : "Pass"}</td>
                <td>{s.Smart}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyzePage;
