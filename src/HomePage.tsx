import { useEffect, useState } from "react";
import SmartFilterLayout from "./components/SmartFilterLayout";
import SmartsFilterResult from "./components/SmartsFilterResult";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "/smartsfilter/api/v1";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [includePasses, setIncludePasses] = useState(true);
  const [includeFails, setIncludeFails] = useState(true);
  // Expert mode configs
  const [hasHeader, setHasHeader] = useState(false);
  const [excludeMolProps, setExcludeMolProps] = useState(false);
  const [strictMode, setStrictMode] = useState(false);
  const [non_zero_row, setNonZeroRows] = useState(false);
  const [uniqueAtoms, setUniqueAtoms] = useState(false);

  // // New expert mode input checkboxes
  const [useKekule, setUseKekule] = useState(false);
  const [useIsomeric, setUseIsomeric] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const addError = (msg: string) => {
    setErrorMessage((prev) => [...prev, msg]);
  };

  useEffect(() => {
    const loadRDKit = async () => {
      const baseUrl =
        "https://unpkg.com/@rdkit/rdkit@2025.3.2-1.0.0/dist";

      try {
        const RDKitModule = await (window as any).initRDKitModule({
          locateFile: (file: string) => `${baseUrl}/${file}`,
        });

        console.log("✅ RDKit ready:", RDKitModule.version());
        setRDKit(RDKitModule);
      } catch (err) {
        console.error("❌ RDKit init failed:", err);
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

  // Helper function to create POST request with JSON body
  const createPostRequest = (url: string, payload: any) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  };

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
      const opreaIsChecked = inputData.filters.includes("Oprea");
      const isExpert = mode === "expert";

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
            } catch (err) {
              addError("Error 400 Invalid Smiles " + smilesArray[idx]);
            }
          });
          resolve();
        });
      });

      let combinedResults: MatchResult[] = [];

      // Helper to build expert params object
      const buildExpertParams = () => {
        const params: any = {};
        if (typeof excludeMolProps === "boolean")
          params.ExcludeMolProp = excludeMolProps;
        if (typeof strictMode === "boolean")
          params.strict_error = strictMode;
        if (typeof uniqueAtoms === "boolean")
          params.unique_set = uniqueAtoms;
        if (typeof useKekule === "boolean")
          params.kekuleSmiles = useKekule;
        if (typeof useIsomeric === "boolean")
          params.isomericSmiles = useIsomeric;
        if (typeof non_zero_row === "boolean")
          params.only_rows = non_zero_row;
        return params;
      };

      // PAINS Filter API call using POST
      if (runmode === "filter" && painsIsChecked) {
        const payload = {
          SMILES: smilesArray,
          Smile_Names: namesArray,
          ...(inputData.config?.excludeMolProps && {
            ExcludeMolProp: inputData.config.excludeMolProps
          })
        };

        const res = await createPostRequest(
          `${API_BASE_URL}/smarts_filter/get_filterpains`,
          payload
        );

        if (res.status !== 200) {
          const errorText = await res.text();
          addError(`Error ${res.status} ${res.statusText}: ${errorText}`);
          return;
        }

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

      // Generic handler for new optimized endpoints (Blake, Glaxo, Oprea, Alarm)
      const runOptimizedFilter = async (filterName: string, endpoint: string) => {
        const payload = {
          SMILES: smilesArray,
          Smile_Names: namesArray,
          ...buildExpertParams()
        };

        try {
          const res = await createPostRequest(
            `${API_BASE_URL}/smarts_filter/${endpoint}`,
            payload
          );

          if (res.status !== 200) {
            const errorText = await res.text();
            addError(`Error ${res.status} ${res.statusText}: ${errorText}`);
            return;
          }

          const json = await res.json();

          // Handle invalid SMILES if returned
          if (json.invalid && json.invalid.length > 0) {
            console.warn(`Invalid SMILES found for ${filterName}:`, json.invalid);
          }

          // all_smarts_filter contains the full list of SMARTS pattern names in the catalog
          const allFilters: string[] = json.all_smarts_filter || [];

          json.results.forEach((entry: any) => {
            try {
              const mol = RDKit.get_mol(entry.smiles);
              const canon = mol.get_smiles();
              mol.delete();

              const isFailed = entry.failed;

              combinedResults.push({
                name: entry.name,
                SMILES: inputCanonMap.get(canon) || canon,
                Smart: entry.reasons.join(", "),
                matched: isFailed,
                failed: isFailed,
                highlightAtoms: entry.highlight_atoms?.flat() ?? [],
                all_pains_filters: allFilters,
                matches: allFilters.map((p: string) => entry.reasons.includes(p)),
                filterName: filterName.toUpperCase(),
              });
            } catch {
              console.warn(`Failed to process ${filterName} entry:`, entry);
            }
          });

        } catch (err) {
          addError(`Failed to run ${filterName} filter: ${(err as Error).message}`);
        }
      };

      if (runmode === "filter") {
        if (blakeIsChecked) await runOptimizedFilter("Blake", "get_filterblake");
        if (opreaIsChecked) await runOptimizedFilter("Oprea", "get_filteroprea");
        if (inputData.filters.includes("Glaxo")) await runOptimizedFilter("Glaxo", "get_filterglaxo");
        if (inputData.filters.includes("Alarm NMR")) await runOptimizedFilter("Alarm NMR", "get_filteralarm");
      }

      // Expert Custom SMARTS mode: single-pass through expert_matchcounts (uses FilterCatalog)
      if (isExpert && inputData.smarts?.content?.trim()) {
        let smartsRaw = "";
        if (inputData.smarts.type === "text") {
          smartsRaw = inputData.smarts.content;
        } else {
          smartsRaw = await readFileContent(inputData.smarts.content);
        }

        const payload = {
          SMILES: smilesArray,
          Smile_Names: namesArray,
          smarts_text: smartsRaw,
          ...buildExpertParams()
        };

        try {
          const expertRes = await createPostRequest(
            `${API_BASE_URL}/smarts_filter/expert_matchcounts`,
            payload
          );

          if (expertRes.status !== 200) {
            const errData = await expertRes.json().catch(() => ({ error: "Unknown error" }));
            addError(`Expert filter error: ${errData.error || "Unknown error"}`);
            if (errData.invalid?.length) {
              errData.invalid.forEach((inv: any) => {
                addError(`Line ${inv.line}: Invalid pattern "${inv.pattern}"`);
              });
            }
            return;
          }

          const expertData = await expertRes.json();
          const allFilters: string[] = expertData.all_smarts_filter || [];

          if (expertData.invalid?.length) {
            expertData.invalid.forEach((inv: any) => {
              addError(`Warning line ${inv.line}: Skipped invalid pattern "${inv.pattern}"`);
            });
          }

          expertData.results.forEach((entry: any) => {
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
                all_pains_filters: allFilters,
                matches: allFilters.map((p: string) => entry.reasons.includes(p)),
                filterName: "CUSTOM",
              });
            } catch {
              console.warn("Failed to process EXPERT entry:", entry);
            }
          });
        } catch (err) {
          addError(`Failed to run expert filter: ${(err as Error).message}`);
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
      batch={batch}
      view={view}
      includePasses={includePasses}
      setIncludePasses={setIncludePasses}
      includeFails={includeFails}
      setIncludeFails={setIncludeFails}
      hasHeader={hasHeader}
      setHasHeader={setHasHeader}
      excludeMolProps={excludeMolProps}
      setExcludeMolProps={setExcludeMolProps}
      strictMode={strictMode}
      setStrictMode={setStrictMode}
      non_zero_row={non_zero_row}
      setNonZeroRows={setNonZeroRows}
      uniqueAtoms={uniqueAtoms}
      setUniqueAtoms={setUniqueAtoms}
      useKekule={useKekule}
      setUseKekule={setUseKekule}
      useIsomeric={useIsomeric}
      setUseIsomeric={setUseIsomeric}
      errorMessage={errorMessage}
      setErrorMessage={setErrorMessage}
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
      <footer
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="RDKit Logo"
          style={{ height: "auto", width: "100px" }}
        />
        <img
          src={`${import.meta.env.BASE_URL}logo192.png`}
          alt="React Logo"
          style={{ height: "auto", width: "100px" }}
        />
        <img
          src={`${import.meta.env.BASE_URL}University_of_New_Mexico_logo.svg`}
          alt="UNM Logo"
          style={{ height: "auto", width: "200px" }}
        />
      </footer>

    </SmartFilterLayout>

  );
}

export default HomePage;