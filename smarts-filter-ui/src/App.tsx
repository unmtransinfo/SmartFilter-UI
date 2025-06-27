// Modified App.tsx to support multi-smarts and detailed per-molecule results

import React, { useState } from "react";
import InputData from "./components/InputData";
import SmartsFilterResult from "./components/SmartsFilterResult";
import ModeSelector from "./components/ModeSelector";

export type MatchResult = {
  name: string;
  SMILES: string;
  n_matches?: number;
  matched?: boolean;
  matches?: boolean[];
};

function App() {
  const [results, setResults] = useState<MatchResult[]>([]);
  const [smarts, setSmarts] = useState<string[]>([]);
  const [mode, setMode] = useState<"filter" | "analyze">("filter");
  const [tMatch, setMatch] = useState<number>(0);

  const readFileContent = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const parseSmilesInput = (
    raw: string,
    delimiter: string,
    smileCol: number,
    nameCol: number | null
  ): [string[], string[]] => {
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const smilesArray: string[] = [];
    const namesArray: string[] = [];

    for (const line of lines) {
      const parts = line.split(new RegExp(`[\\t,${delimiter}]+`)).filter(Boolean);

      const smile = parts[smileCol] || "";
      smilesArray.push(smile);

      let name = "";
      if (nameCol !== null && parts[nameCol]) {
        name = parts[nameCol];
      } else {
        name = smile;
      }
      namesArray.push(name);
    }

    return [smilesArray, namesArray];
  };

  const handleSubmit = async (inputData: {
    smiles: { type: "text" | "file"; content: string | File };
    smarts: { type: "text" | "file"; content: string | File };
    delimiter: string;
    smileCol: number;
    nameCol: number | null;
  }) => {
    let smilesRaw = "";
    let smartsRaw = "";

    if (inputData.smiles.type === "text") {
      smilesRaw = inputData.smiles.content as string;
    } else {
      smilesRaw = await readFileContent(inputData.smiles.content as File);
    }

    if (inputData.smarts.type === "text") {
      smartsRaw = inputData.smarts.content as string;
    } else {
      smartsRaw = await readFileContent(inputData.smarts.content as File);
    }

    const [smilesArray, namesArray] = parseSmilesInput(
      smilesRaw,
      inputData.delimiter,
      inputData.smileCol,
      inputData.nameCol
    );

    const smartsArray = smartsRaw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSmarts(smartsArray);
    setMatch(smilesArray.length);

    if (!smilesArray.length || !smartsArray.length) return;

    try {
      const query = new URLSearchParams();
      query.append("SMILES", smilesArray.join(","));
      query.append("Smile_Names", namesArray.join(","));
      smartsArray.forEach((s) => query.append("smarts", s));

      const res = await fetch(
        `http://localhost:5000/api/v1/smarts_filter/get_matchcounts?strict=true&${query}`
      );

      const json = await res.json();

      const formattedResults: MatchResult[] = json.map((mol: any) => {
        const matchFlags = mol.match_flags || [];
        const totalMatches = matchFlags.filter(Boolean).length;

        // A molecule fails only if it matches at least one but not all smarts
        const result =
          totalMatches > 0 && totalMatches < smartsArray.length ? false : true;

        return {
          name: mol.name || mol.SMILES || mol.smiles,
          SMILES: mol.smiles || mol.SMILES,
          n_matches: totalMatches,
          matched: result,
          matches: matchFlags,
        };
      });

      setResults(formattedResults);
    } catch (error) {
      console.error("Error fetching match results:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <ModeSelector mode={mode} onModeChange={setMode} />

      <InputData onSubmit={handleSubmit} />

      <SmartsFilterResult
        matchCounts={results}
        smarts={smarts}
        mode={mode}
        totalMatched={tMatch}
      />
    </div>
  );
}

export default App;
