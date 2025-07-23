import React, { useEffect, useState } from "react";
import InputData from "./components/InputData";
import SmartFilterLayout from "./components/SmartFilterLayout";
import SmartsFilterResult from "./components/SmartsFilterResult";
import initRDKitModule from "@rdkit/rdkit"; 

export type MatchResult = {
  name: string;
  SMILES: string;
  Smart?: string;
  n_matches?: number;
  matched?: boolean;
  matches?: boolean[];
  failed?: boolean;
};

// type RunMode = "filter" | "analyze1mol";
// type AppMode = "normal" | "expert";

function App() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [smarts, setSmarts] = useState<{ smarts: string; name: string }[]>([]);
  const [mode, setMode] = useState<AppMode>("normal");
  const [runmode, setRunmode] = useState<RunMode>("filter");
  const [tMatch, setMatch] = useState<number>(0);
  const [RDKit, setRDKit] = useState<any>(null);

  useEffect(() => {
    const loadRDKit = async () => {
      try {
        const RDKitModule = await initRDKitModule({
          locateFile: () => "/RDKit_minimal.wasm",
        });
        setRDKit(RDKitModule);
        console.log("RDKit.js initialized in App");
      } catch (err) {
        console.error("RDKit.js init failed", err);
      }
    };
    loadRDKit();
  }, []);

  const readFileContent = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleSubmit = async (inputData: any) => {
    let smilesRaw = "";
    let smartsRaw = "";

    if (inputData.smiles.type === "text") {
      smilesRaw = inputData.smiles.content;
    } else {
      smilesRaw = await readFileContent(inputData.smiles.content);
    }

    if (inputData.smarts.type === "text") {
      smartsRaw = inputData.smarts.content;
    } else {
      smartsRaw = await readFileContent(inputData.smarts.content);
    }

    const lines = smilesRaw.split(/\r?\n/).filter(Boolean);
    const smilesArray: string[] = [];
    const namesArray: string[] = [];

    for (const line of lines) {
      const parts = line.split(new RegExp(`[\t,${inputData.delimiter}]+`)).filter(Boolean);
      const smile = parts[inputData.smileCol] || "";
      smilesArray.push(smile);
      namesArray.push(inputData.nameCol !== null && parts[inputData.nameCol] ? parts[inputData.nameCol] : smile);
    }
    
    const smartsArray = smartsRaw
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(/\s+/); 
          return {
            smarts: parts[0],
            name: parts[1] || `S${Math.random().toString(36).slice(2, 6)}`, 
          };
        });
    setSmarts(smartsArray);
    setMatch(smilesArray.length);

    const query = new URLSearchParams();
    query.append("SMILES", smilesArray.join(","));
    query.append("Smile_Names", namesArray.join(","));

    if (mode === "normal") {
      if (runmode === "filter") {
        const inputCanonMap = new Map<string, string>();
        const inputNameMap = new Map<string, string>();
        smilesArray.forEach((smi, idx) => {
          try {
            const mol = RDKit.get_mol(smi);
            const canon = mol.get_smiles();
            mol.delete();
            inputCanonMap.set(canon, smi);
            inputNameMap.set(canon, namesArray[idx]);
          } catch {
            console.warn("Invalid SMILES:", smi);
          }
        });

        const allFailures: MatchResult[] = [];

        for (let i = 0; i < smartsArray.length; i++) {
          const query = new URLSearchParams();
          query.append("SMILES", smilesArray.join(","));
          query.append("Smile_Names", namesArray.join(","));
          query.append("smarts", smartsArray[i].smarts);

          const res = await fetch(
            `http://localhost:8000/api/v1/smarts_filter/get_matchfilter?${query}`
          );
          const json = await res.json();
          const failedCanon = json.failed
            .map((m: any) => {
              try {
                const mol = RDKit.get_mol(m.smiles);
                const canon = mol.get_smiles();
                mol.delete();
                return canon;
              } catch {
                return null;
              }
            })
            .filter(Boolean);

          const passedCanon = json.passed
            .map((m: any) => {
              try {
                const mol = RDKit.get_mol(m.smiles);
                const canon = mol.get_smiles();
                mol.delete();
                return canon;
              } catch {
                return null;
              }
            })
            .filter(Boolean);

          failedCanon.forEach((canonSmiles: string) => {
            allFailures.push({
              name: inputNameMap.get(canonSmiles) || canonSmiles,
              SMILES: inputCanonMap.get(canonSmiles) || canonSmiles,
              Smart: smartsArray[i].name,
              matched: true,
              failed: true,
            });
          });

          passedCanon.forEach((canonSmiles: string) => {
            allFailures.push({
              name: inputNameMap.get(canonSmiles) || canonSmiles,
              SMILES: inputCanonMap.get(canonSmiles) || canonSmiles,
              Smart: smartsArray[i].name,
              matched: false,
              failed: false,
            });
          });

        }
        
        setResults(allFailures);
      }
    else if (runmode === "analyze1mol") {
      const inputCanonMap = new Map<string, string>();
      const inputNameMap = new Map<string, string>();
      smilesArray.forEach((smi, idx) => {
        try {
          const mol = RDKit.get_mol(smi);
          const canon = mol.get_smiles();
          mol.delete();
          inputCanonMap.set(canon, smi);
          inputNameMap.set(canon, namesArray[idx]);
        } catch {
          console.warn("Invalid SMILES:", smi);
        }
      });

      const allResults: MatchResult[] = [];

      smartsArray.forEach(s => query.append("smarts", s.smarts));
      smartsArray.forEach(s => query.append("Smart_Names", s.name));

      const res = await fetch(
        `http://localhost:8000/api/v1/smarts_filter/get_multi_matchfilter?${query}`
      );
      const json = await res.json();

      json.passed.forEach((mol: any) => {
        try {
          const molObj = RDKit.get_mol(mol.smiles);
          const canon = molObj.get_smiles();
          molObj.delete();

          allResults.push({
            name: mol.name || inputNameMap.get(canon) || canon,
            SMILES: mol.smiles || inputCanonMap.get(canon) || canon,
            matched: false,
            failed: false,
          });
        } catch {
          // silently skip bad mols
        }
      });

      json.failed.forEach((mol: any) => {
        try {
          const molObj = RDKit.get_mol(mol.smiles);
          const canon = molObj.get_smiles();
          molObj.delete();

          allResults.push({
            name: mol.name || inputNameMap.get(canon) || canon,
            SMILES: mol.smiles || inputCanonMap.get(canon) || canon,
            matched: true, 
            failed: true,
          });
        } catch {
          
        }
      });

      setResults(allResults);
    }

    }
  };

  // return (
  //   <div className="p-4 space-y-4">
  //     <div className="flex gap-4 items-center">
  //       <label className="font-semibold">Mode:</label>
  //       <select
  //         value={mode}
  //         onChange={(e) => setMode(e.target.value as AppMode)}
  //         className="border p-1"
  //       >
  //         <option value="normal">Normal</option>
  //         <option value="expert">Expert</option>
  //       </select>

  //       <label className="font-semibold">Run Mode:</label>
  //       <select
  //         value={runmode}
  //         onChange={(e) => setRunmode(e.target.value as RunMode)}
  //         className="border p-1"
  //       >
  //         <option value="filter">Filter</option>
  //         <option value="analyze1mol">Analyze One Molecule</option>
  //       </select>
  //     </div>

  //     <InputData onSubmit={handleSubmit} />

  //     <SmartsFilterResult
  //       matchCounts={results}
  //       mode={runmode}
  //       totalMatched={tMatch}
  //     />
  //   </div>
  // );
    return (
      <SmartFilterLayout
        mode={mode}
        setMode={setMode}
        runmode={runmode}
        setRunmode={setRunmode}
        onSubmit={handleSubmit}
      >
        <SmartsFilterResult
          matchCounts={results}
          mode={runmode}
          totalMatched={tMatch}
        />
      </SmartFilterLayout>
  );
}
export type RunMode = "filter" | "analyze1mol";
export type AppMode = "normal" | "expert";

export default App;
