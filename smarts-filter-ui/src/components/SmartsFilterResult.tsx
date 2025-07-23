import React, { useEffect, useState } from "react";
import { MatchResult } from "../App";
import initRDKitModule from "@rdkit/rdkit";

type Props = {
  matchCounts: MatchResult[];
  mode: string;
  totalMatched: number;
};

const SmartsFilterResult: React.FC<Props> = ({
  matchCounts,
  mode,
  totalMatched,
}) => {
  const [RDKit, setRDKit] = useState<any>(null);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        const RDKitModule = await initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm",
        });

        if (RDKitModule) {
          console.log("RDKit.js initialized");
          setRDKit(RDKitModule); 
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
          style={{ width: 'auto'}}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    } catch (e) {
      return <div>Error rendering</div>;
    }
  };

  return (
    <div className="overflow-auto max-w-full">
      <table className="table-auto border-separate border-spacing-x-5 ...">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-[20px] py-1">Index</th>
            <th className="border px-[20px] py-1">Molecule</th>
            <th className="border px-[20px] py-1">Name</th>
            <th className="border px-[20px] py-1">SMARTS Name</th>
            <th className="border px-[20px] py-1">Result</th>
          </tr>
        </thead>
        <tbody>
          {matchCounts.map((mol, idx) => (
          <tr
            key={idx}
            className={
              mol.failed ? "bg-red-50 text-red-700 font-medium" : "bg-green-50"
            }
          >
            <td className="border px-[20px] py-1 text-center">{idx + 1}</td>
            <td className="border px-[20px] py-1">{renderMoleculeSVG(mol.SMILES)}</td>
            <td className="border px-[20px] py-1">{mol.name}</td>
            <td className="border px-[20px] py-1 text-center">{mol.Smart}</td>
            <td className="border px-[20px] py-1 text-center">{mol.failed ? "Fail" : "Pass"}</td>
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
