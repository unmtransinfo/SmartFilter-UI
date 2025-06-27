// InputData.tsx
import React, { useState } from "react";

type InputProps = {
  onSubmit: (input: {
    smiles: { type: "text" | "file"; content: string | File };
    smarts: { type: "text" | "file"; content: string | File };
    delimiter: string;
    smileCol: number;
    nameCol: number | null;
  }) => void;
};

const InputData: React.FC<InputProps> = ({ onSubmit }) => {
  const [smilesType, setSmilesType] = useState<"text" | "file">("text");
  const [smartsType, setSmartsType] = useState<"text" | "file">("text");

  const [smilesText, setSmilesText] = useState("");
  const [smartsText, setSmartsText] = useState("");

  const [smilesFile, setSmilesFile] = useState<File | null>(null);
  const [smartsFile, setSmartsFile] = useState<File | null>(null);

  const [smileCol, setSmileCol] = useState<number>(0);
  const [nameCol, setNameCol] = useState<number | null>(1);

  const [delimiter, setDelimiter] = useState<string>(' ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (smilesType === "text" && !smilesText.trim()) ||
      (smilesType === "file" && !smilesFile) ||
      (smartsType === "text" && !smartsText.trim()) ||
      (smartsType === "file" && !smartsFile)
    ) {
      alert("Please fill both SMILES and SMARTS inputs.");
      return;
    }

    onSubmit({
      smiles: {
        type: smilesType,
        content: smilesType === "text" ? smilesText : smilesFile!,
      },
      smarts: {
        type: smartsType,
        content: smartsType === "text" ? smartsText : smartsFile!,
      },
      delimiter,
      smileCol,
      nameCol,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: 20 }}>
      <h2>Input Molecule Data</h2>
       <div>
        <label>
          Delimiter:
          <input
            type="text"
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            placeholder="e.g. space, comma, tab"
            style={{ width: "40px", marginLeft: "0.5rem" }}
          />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          SMILES column index:
          <input
            type="number"
            min={0}
            value={smileCol}
            onChange={(e) => setSmileCol(Number(e.target.value))}
            style={{ width: "50px", marginLeft: "0.5rem" }}
          />
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Name column index (or blank):
          <input
            type="number"
            value={nameCol !== null ? nameCol : 1}
            onChange={(e) =>
              setNameCol(e.target.value === "" ? null : Number(e.target.value))
            }
            placeholder="optional"
            style={{ width: "50px", marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* SMILES Input */}
        <div style={{ flex: 1 }}>
          <h3>SMILES Input</h3>
          <div style={{ marginBottom: 8 }}>
            <label>
              <input
                type="radio"
                value="text"
                checked={smilesType === "text"}
                onChange={() => setSmilesType("text")}
              />
              Text
            </label>
            <label style={{ marginLeft: 12 }}>
              <input
                type="radio"
                value="file"
                checked={smilesType === "file"}
                onChange={() => setSmilesType("file")}
              />
              File
            </label>
          </div>

          {smilesType === "text" ? (
            <textarea
              rows={5}
              value={smilesText}
              onChange={(e) => setSmilesText(e.target.value)}
              placeholder="Paste SMILES here, optionally with name separated by delimiter..."
              style={{ width: "100%", padding: 8 }}
            />
          ) : (
            <input
              type="file"
              accept=".smi,.txt"
              onChange={(e) => setSmilesFile(e.target.files?.[0] || null)}
            />
          )}
        </div>

        {/* SMARTS Input */}
        <div style={{ flex: 1 }}>
          <h3>SMARTS Input</h3>
          <div style={{ marginBottom: 8 }}>
            <label>
              <input
                type="radio"
                value="text"
                checked={smartsType === "text"}
                onChange={() => setSmartsType("text")}
              />
              Text
            </label>
            <label style={{ marginLeft: 12 }}>
              <input
                type="radio"
                value="file"
                checked={smartsType === "file"}
                onChange={() => setSmartsType("file")}
              />
              File
            </label>
          </div>

          {smartsType === "text" ? (
            <textarea
              rows={5}
              value={smartsText}
              onChange={(e) => setSmartsText(e.target.value)}
              placeholder="Paste SMARTS here..."
              style={{ width: "100%", padding: 8 }}
            />
          ) : (
            <input
              type="file"
              accept=".smi,.txt,.sma,.smarts"
              onChange={(e) => setSmartsFile(e.target.files?.[0] || null)}
            />
          )}
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button type="submit">Submit Input</button>
      </div>
    </form>
  );
};

export default InputData;
