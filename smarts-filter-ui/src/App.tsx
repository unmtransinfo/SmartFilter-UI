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
  highlightAtoms?: number[];
};

function App() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [mode, setMode] = useState<AppMode>("normal");
  const [runmode, setRunmode] = useState<RunMode>("filter");
  const [tMatch, setMatch] = useState<number>(0);
  const [RDKit, setRDKit] = useState<any>(null);
  const [batch, setBatch] = useState(false);
  const [view, setView] = useState(false);
  const [depict, setDepict] = useState(false);
  const [painsChecked, setPainsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let smilesRaw = "";
      if (inputData.smiles.type === "text") {
        smilesRaw = inputData.smiles.content;
      } else {
        smilesRaw = await readFileContent(inputData.smiles.content);
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
      setMatch(smilesArray.length);
      const painsIsChecked = inputData.filters.includes("Pains");
      const blakeIsChecked = inputData.filters.includes("Blake");
      setPainsChecked(painsIsChecked);

      const inputCanonMap = new Map<string, string>();
      const inputNameMap = new Map<string, string>();

      await new Promise<void>((resolve) => {
        requestIdleCallback(() => {
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
          resolve();
        });
      });

      let combinedResults: MatchResult[] = [];
      // === PAINS Filter ===
      if (painsIsChecked) {
        const query = new URLSearchParams();
        query.append("SMILES", smilesArray.join(","));
        query.append("Smile_Names", namesArray.join(","));

        const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_filterpains?${query}`);
        const json = await res.json();

        json.forEach((entry: any) => {
          try {
            const mol = RDKit.get_mol(entry.smiles);
            const canon = mol.get_smiles();
            mol.delete();

            const highlightIndices = entry.highlight_atoms?.flat() ?? [];

            combinedResults.push({
              name: entry.name || inputNameMap.get(canon) || canon,
              SMILES: inputCanonMap.get(canon) || canon,
              Smart: "PAINS",
              matched: entry.failed,
              failed: entry.failed,
              highlightAtoms: highlightIndices,
            });
          } catch {
            console.warn("Failed to process PAINS entry:", entry);
          }
        });
      }

      if (blakeIsChecked) {
        const smartsText = await fetch("/data/ursu_pains.sma").then(res => res.text());
        const smartsPatterns = smartsText
          .split(/\r?\n/)
          .filter(line => line.trim().length > 0)
          .map(line => {
            const parts = line.trim().split(/\s+/);
            return { smarts: parts[0], name: parts[1] || "unknown" };
          });

        const query = new URLSearchParams();
        query.append("SMILES", smilesArray.join(","));
        query.append("Smile_Names", namesArray.join(","));
        smartsPatterns.forEach((s) => {
            query.append("smarts", s.smarts);
            query.append("Smart_Names", s.name);
      });

        console.log(smartsPatterns)
        const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_multi_matchfilter?${query}`);
        const json = await res.json();

        json.failed?.forEach((entry: any) => {
          try {
            const mol = RDKit.get_mol(entry.smiles);
            const canon = mol.get_smiles();
            mol.delete();

            combinedResults.push({
              name: entry.name || inputNameMap.get(canon) || canon,
              SMILES: inputCanonMap.get(canon) || canon,
              Smart: "Blake",
              matched: true,
              failed: true,
              highlightAtoms: entry.highlight_atoms?.flat() ?? [],
            });
          } catch {}
        });

        json.passed?.forEach((entry: any) => {
          try {
            const mol = RDKit.get_mol(entry.smiles);
            const canon = mol.get_smiles();
            mol.delete();

            combinedResults.push({
              name: entry.name || inputNameMap.get(canon) || canon,
              SMILES: inputCanonMap.get(canon) || canon,
              Smart: entry.reason || "Blake",
              matched: false,
              failed: false,
              highlightAtoms: [],
            });
          } catch {}
        });
      }


      // === If no filters checked, fallback to normal SMARTS input filter ===
      if (!painsIsChecked && !blakeIsChecked) {
        let smartsRaw = "";
        if (inputData.smarts && inputData.smarts.type === "text") {
          smartsRaw = inputData.smarts.content;
        } else if (inputData.smarts) {
          smartsRaw = await readFileContent(inputData.smarts.content);
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

        if (mode === "normal" && runmode === "filter") {
          for (let i = 0; i < smartsArray.length; i++) {
            const query = new URLSearchParams();
            query.append("SMILES", smilesArray.join(","));
            query.append("Smile_Names", namesArray.join(","));
            query.append("smarts", smartsArray[i].smarts);

            const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_matchfilter?${query}`);
            const json = await res.json();

            json.failed?.forEach((m: any) => {
              try {
                const mol = RDKit.get_mol(m.smiles);
                const canon = mol.get_smiles();
                mol.delete();

                combinedResults.push({
                  name: inputNameMap.get(canon) || canon,
                  SMILES: inputCanonMap.get(canon) || canon,
                  Smart: smartsArray[i].name,
                  matched: true,
                  failed: true,
                });
              } catch {}
            });

            json.passed?.forEach((m: any) => {
              try {
                const mol = RDKit.get_mol(m.smiles);
                const canon = mol.get_smiles();
                mol.delete();

                combinedResults.push({
                  name: inputNameMap.get(canon) || canon,
                  SMILES: inputCanonMap.get(canon) || canon,
                  Smart: smartsArray[i].name,
                  matched: false,
                  failed: false,
                });
              } catch {}
            });
          }
        }
      }

      // Sort so failed are on top
      combinedResults.sort((a, b) => Number(b.failed) - Number(a.failed));

      setResults(combinedResults);

    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SmartFilterLayout
      mode={mode}
      setMode={setMode}
      runmode={runmode}
      setRunmode={setRunmode}
      onSubmit={handleSubmit}
      setBatch={setBatch}
      setView={setView}
      setDepict={setDepict}
      setPainsChecked={setPainsChecked}
      view={view}
      depict={depict}
    >
      <SmartsFilterResult
        matchCounts={results}
        mode={runmode}
        totalMatched={tMatch}
        batch={batch}
        view={view}
        depict={depict}
      />
    </SmartFilterLayout>
  );
}

export type RunMode = "filter" | "analyze1mol";
export type AppMode = "normal" | "expert";

export default App;
