import React, { useEffect, useState } from "react";
import { MatchResult } from "../App";
import initRDKitModule from "@rdkit/rdkit"; // ✅ FIXED: proper import

type Props = {
  matchCounts: MatchResult[];
  smarts: string[];
  mode: "filter" | "analyze";
  totalMatched: number;
};

const SmartsFilterResult: React.FC<Props> = ({
  matchCounts,
  smarts,
  mode,
  totalMatched,
}) => {
  const [RDKit, setRDKit] = useState<any>(null);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        const RDKitModule = await initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm", // ✅ Match your public folder
        });

        if (RDKitModule) {
          console.log("RDKit.js initialized");
          setRDKit(RDKitModule); // ✅ FIXED: state set correctly
        }
      } catch (e) {
        console.error("RDKit initialization failed", e);
      }
    };

    loadRDKit();
  }, []);

  const renderMoleculeSVG = (smiles: string) => {
    if (!RDKit) return <div>Loading...</div>;

    try {
      const mol = RDKit.get_mol(smiles);
      const svg = mol.get_svg();
      mol.delete();
      return (
        <div
          style={{ width: 120, height: 80 }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    } catch (e) {
      return <div>Error rendering</div>;
    }
  };

  return (
    <div className="overflow-auto max-w-full">
      <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Molecule</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Result</th>
            <th className="border px-2 py-1">Match Table</th>
          </tr>
        </thead>
        <tbody>
          {matchCounts.map((mol, idx) => (
            <tr
              key={idx}
              className={
                mol.matched ? "bg-green-50" : "bg-red-50 text-red-700 font-medium"
              }
            >
              <td className="border px-2 py-1 text-center">{idx + 1}</td>
              <td className="border px-2 py-1">{renderMoleculeSVG(mol.SMILES)}</td>
              <td className="border px-2 py-1">{mol.name}</td>
              <td className="border px-2 py-1 text-center">
                {mol.matched ? "Pass" : "Fail"}
              </td>
              <td className="border px-2 py-1">
                <table className="w-full text-xs border-collapse border">
                  <thead>
                    <tr>
                      {smarts.map((_, i) => (
                        <th key={i} className="border px-1 py-0.5 text-center">
                          S{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {mol.matches?.map((flag, i) => (
                        <td
                          key={i}
                          className={`border px-1 py-0.5 text-center ${
                            flag ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {flag ? "✓" : "✗"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
          {matchCounts.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="border px-2 py-3 text-center text-gray-500"
              >
                No results to display
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-2 text-sm">
        Total molecules: {matchCounts.length} | Displaying {totalMatched}
      </div>
    </div>
  );
};

export default SmartsFilterResult;
