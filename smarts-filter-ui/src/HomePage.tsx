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
  const [batch, setBatch] = useState(true);
  const [view, setView] = useState(false);
  const [painsChecked, setPainsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includePasses, setIncludePasses] = useState(true);
  const [includeFails, setIncludeFails] = useState(true);


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

    // Skip header if hasHeader true
    const hasHeader = inputData.config?.hasHeader ?? false;
    let lines = smilesRaw.split(/\r?\n/).filter(Boolean);
    if (hasHeader) {
      lines = lines.slice(1); // Skip first line (header)
    }

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
    const isExpert = mode === "expert";
    setPainsChecked(painsIsChecked);

    // Cache canonical smiles and names
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

    // Helper to append expert params
    const appendExpertParams = (query: URLSearchParams) => {
      if (!inputData.config) return;
      if (typeof inputData.config.excludeMolProps === "boolean")
        query.append("exclude_molprops", inputData.config.excludeMolProps ? "true" : "false");
      if (typeof inputData.config.strictMode === "boolean")
        query.append("strict_mode", inputData.config.strictMode ? "true" : "false");
      if (typeof inputData.config.uniqueAtoms === "boolean")
        query.append("unique_atoms", inputData.config.uniqueAtoms ? "true" : "false");
      if (typeof inputData.config.kekule === "boolean")
        query.append("kekule", inputData.config.kekule ? "true" : "false");
      if (typeof inputData.config.isomeric === "boolean")
        query.append("isomeric", inputData.config.isomeric ? "true" : "false");
    };

    // PAINS Filter API call (only excludeMolProps)
    if (runmode === "filter" && painsIsChecked) {
      const query = new URLSearchParams();
      query.append("SMILES", smilesArray.join(","));
      query.append("Smile_Names", namesArray.join(","));
      if (inputData.config?.excludeMolProps) {
        query.append("exclude_molprops", inputData.config.excludeMolProps ? "true" : "false");
      }

      const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_filterpains?${query}`);
      const json = await res.json();

      json.results.forEach((entry: any) => {
        try {
          const mol = RDKit.get_mol(entry.smiles);
          const canon = mol.get_smiles();
          mol.delete();

          combinedResults.push({
            name: entry.name,
            SMILES: inputCanonMap.get(canon) || canon,
            Smart: entry.reasons.join(", "),
            matched: entry.failed,
            failed: entry.failed,
            highlightAtoms: entry.highlight_atoms?.flat() ?? [],
            all_pains_filters: json.all_pains_filters,
            matches: json.all_pains_filters.map((p: string) => entry.reasons.includes(p)),
            filterName: "PAINS",
          });
        } catch {
          console.warn("Failed to process PAINS entry:", entry);
        }
      });
    }

    // BLAKE Filter API call with expert params
    if (runmode === "filter" && blakeIsChecked) {
      const smartsText = await fetch("/data/ursu_pains.sma").then((res) => res.text());
      const smartsPatterns = smartsText
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .map((line) => {
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
      appendExpertParams(query);

      const res = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_multi_matchcounts?${query}`);
      const json = await res.json();

      json.forEach((entry: any) => {
        try {
          const mol = RDKit.get_mol(entry.smiles);
          const canon = mol.get_smiles();
          mol.delete();

          const isFailed = entry.matches.some((match: any) => match.count > 0);
          const highlightAtomsFlat: number[] = entry.matches
            .flatMap((match: any) => match.highlight_atoms ?? [])
            .flat()
            .filter((x: number): x is number => typeof x === "number");
          const uniqueHighlightAtoms = Array.from(new Set(highlightAtomsFlat));
          const matchBooleans: boolean[] = entry.matches.map((match: any) => match.count > 0);

          combinedResults.push({
            name: entry.name,
            SMILES: inputCanonMap.get(canon) || canon,
            Smart: entry.matches
              .filter((m: any) => m.count > 0)
              .map((m: any) => m.name)
              .join(", "),
            matched: isFailed,
            failed: isFailed,
            highlightAtoms: uniqueHighlightAtoms,
            all_pains_filters: smartsPatterns.map((p) => p.name),
            matches: matchBooleans,
            filterName: "BLAKE",
          });
        } catch {
          console.warn("Failed to process BLAKE entry:", entry);
        }
      });
    }

    // Expert Custom SMARTS mode
    if (isExpert && inputData.smarts?.content?.trim()) {
      let smartsRaw = "";
      if (inputData.smarts.type === "text") {
        smartsRaw = inputData.smarts.content;
      } else {
        smartsRaw = await readFileContent(inputData.smarts.content);
      }

      const customSmartsLines = smartsRaw.split(/\r?\n/).filter((line: string) => line.trim().length > 0);
      const customSmartsPatterns = customSmartsLines.map((line: string) => {
        const parts = line.trim().split(/\s+/);
        return { smarts: parts[0], name: parts[1] || "custom" };
      });

      const expertQuery = new URLSearchParams();
      expertQuery.append("SMILES", smilesArray.join(","));
      expertQuery.append("Smile_Names", namesArray.join(","));
      customSmartsPatterns.forEach((s) => {
        expertQuery.append("smarts", s.smarts);
        expertQuery.append("Smart_Names", s.name);
      });
      appendExpertParams(expertQuery);

      const expertRes = await fetch(`http://localhost:8000/api/v1/smarts_filter/get_multi_matchcounts?${expertQuery}`);
      const expertJson = await expertRes.json();

      expertJson.forEach((entry: any) => {
        try {
          const mol = RDKit.get_mol(entry.smiles);
          const canon = mol.get_smiles();
          mol.delete();

          const isFailed = entry.matches.some((match: any) => match.count > 0);
          const highlightAtomsFlat: number[] = entry.matches
            .flatMap((match: any) => match.highlight_atoms ?? [])
            .flat()
            .filter((x: number): x is number => typeof x === "number");
          const uniqueHighlightAtoms = Array.from(new Set(highlightAtomsFlat));
          const matchBooleans = entry.matches.map((match: any) => match.count > 0);

          combinedResults.push({
            name: entry.name,
            SMILES: inputCanonMap.get(canon) || canon,
            Smart: entry.matches
              .filter((m: any) => m.count > 0)
              .map((m: any) => m.name)
              .join(", "),
            matched: isFailed,
            failed: isFailed,
            highlightAtoms: uniqueHighlightAtoms,
            all_pains_filters: customSmartsPatterns.map((p) => p.name),
            matches: matchBooleans,
            filterName: "CUSTOM",
          });
        } catch {
          console.warn("Failed to process EXPERT entry:", entry);
        }
      });
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
      batch={batch}
      view={view}
      includePasses={includePasses}
      setIncludePasses={setIncludePasses}
      includeFails={includeFails}
      setIncludeFails={setIncludeFails}
    >
      <SmartsFilterResult
        matchCounts={results}
        mode={runmode}
        totalMatched={tMatch}
        batch={batch}
        view={view}
        includePasses={includePasses}
        includeFails={includeFails}
      />
    </SmartFilterLayout>
  );
}

export default HomePage;
