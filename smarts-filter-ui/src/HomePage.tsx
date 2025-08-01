import React, { useEffect, useState } from "react";
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
  all_pains_filters?: string[];
  filterName?: string;
};

export type RunMode = "filter" | "analyze1mol";
export type AppMode = "normal" | "expert";

function HomePage() {
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
    const query = new URLSearchParams();
    query.append("SMILES", smilesArray.join(","));
    query.append("Smile_Names", namesArray.join(","));

    // ===== FILTER MODE =====
    if (runmode === "filter") {
      if (painsIsChecked) {
        const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_filterpains?${query}`);
        const json = await res.json();

        json.results.forEach((entry: any) => {
          try {
            const mol = RDKit.get_mol(entry.smiles);
            const canon = mol.get_smiles();
            mol.delete();

            const patternMatches: { [pattern: string]: boolean } = {};
            json.all_pains_filters.forEach((patternName: string) => {
              patternMatches[patternName] = entry.reasons.includes(patternName);
            });

            combinedResults.push({
              name: entry.name,
              SMILES: inputCanonMap.get(canon) || canon,
              Smart: entry.reasons.join(", "),
              matched: entry.failed,
              failed: entry.failed,
              highlightAtoms: entry.highlight_atoms?.flat() ?? [],
              all_pains_filters: json.all_pains_filters,
              matches: json.all_pains_filters.map(
                (p: string) => entry.reasons.includes(p)
              ),
              filterName: "PAINS",
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
        console.log(smartsPatterns);
        // Append all smarts and names to query if needed (optional)
        smartsPatterns.forEach((s) => {
          query.append("smarts", s.smarts);
          query.append("Smart_Names", s.name);
        });

        const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_multi_matchfilter?${query}`);
        const json = await res.json();

        // Collect all molecules (failed + passed) keyed by smiles
        const molMap = new Map<string, any>();
        json.failed?.forEach((entry: any) => {
          molMap.set(entry.smiles, { ...entry, failed: true });
        });
        json.passed?.forEach((entry: any) => {
          if (!molMap.has(entry.smiles)) {
            molMap.set(entry.smiles, { ...entry, failed: false });
          }
        });

        molMap.forEach((entry) => {
          try {
            const mol = RDKit.get_mol(entry.smiles);
            const canon = mol.get_smiles();
            mol.delete();

            // Build boolean array for each pattern: true if matched, false otherwise
            const matchesArray = smartsPatterns.map((pattern) => {
              // If your API returns 'reasons' array use it, else single 'reason' string
              if (entry.reasons && Array.isArray(entry.reasons)) {
                return entry.reasons.includes(pattern.name);
              }
              return entry.reason === pattern.name;
            });

            combinedResults.push({
              name: entry.name,
              SMILES: inputCanonMap.get(canon) || canon,
              failed: entry.failed,
              highlightAtoms: entry.highlight_atoms?.flat() ?? [],
              all_pains_filters: smartsPatterns.map((p) => p.name),
              matches: matchesArray,
              filterName: "Blake",
            });
          } catch (e) {
            console.warn("Error processing Blake molecule", e);
          }
        });
      }
    }
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
      setPainsChecked={setPainsChecked}
      view={view}
    >
      <SmartsFilterResult
        matchCounts={results}
        mode={runmode}
        totalMatched={tMatch}
        batch={batch}
        view={view}
      />
    </SmartFilterLayout>
  );
}
export default HomePage;

