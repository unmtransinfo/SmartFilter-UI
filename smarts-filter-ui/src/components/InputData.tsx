import React, { useRef, useState } from "react";

const InputData = ({ onSubmit }: any) => {
  const [smilesText, setSmilesText] = useState("");
  const [smartsText, setSmartsText] = useState("");

  const smilesFileInput = useRef<HTMLInputElement>(null);
  const smartsFileInput = useRef<HTMLInputElement>(null);

  // Load file content to text area
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setter(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!smilesText.trim() || !smartsText.trim()) {
          alert("Please provide both SMILES and SMARTS data.");
          return;
        }
        onSubmit({
          smiles: { type: "text", content: smilesText },
          smarts: { type: "text", content: smartsText },
          delimiter: " ",
          smileCol: 0,
          nameCol: null,
        });
      }}
      style={{ padding: 20 }}
    >
      <h2>Input Data</h2>

 <div style={{ display: "flex", gap: "20px" }}>
  {/* SMILES Input Card */}
  <div
    style={{
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      padding: 20,
      border: "1px solid #e0e0e0",
    }}
  >
    <label
      style={{
        fontWeight: "600",
        display: "block",
        marginBottom: 8,
      }}
    >
      SMILES Input:
    </label>
    <button
      type="button"
      onClick={() => smilesFileInput.current?.click()}
      style={{
        marginBottom: 12,
        padding: "8px 16px",
        borderRadius: 6,
        border: "none",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Upload
    </button>
    <input
      type="file"
      accept=".smi,.txt"
      ref={smilesFileInput}
      style={{ display: "none" }}
      onChange={(e) => handleFileUpload(e, setSmilesText)}
    />
    <textarea
      rows={8}
      value={smilesText}
      onChange={(e) => setSmilesText(e.target.value)}
      placeholder="Paste SMILES here or upload a file above"
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 8,
        border: "1px solid #ced4da",
        fontSize: 14,
        resize: "vertical",
      }}
    />
  </div>

  {/* SMARTS Input Card */}
  <div
    style={{
      flex: 1,
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      padding: 20,
      border: "1px solid #e0e0e0",
    }}
  >
    <label
      style={{
        fontWeight: "600",
        display: "block",
        marginBottom: 8,
      }}
    >
      SMARTS Input:
    </label>
    <button
      type="button"
      onClick={() => smartsFileInput.current?.click()}
      style={{
        marginBottom: 12,
        padding: "8px 16px",
        borderRadius: 6,
        border: "none",
        backgroundColor: "#007bff",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Upload
    </button>
    <input
      type="file"
      accept=".smi,.txt,.sma,.smarts"
      ref={smartsFileInput}
      style={{ display: "none" }}
      onChange={(e) => handleFileUpload(e, setSmartsText)}
    />
    <textarea
      rows={8}
      value={smartsText}
      onChange={(e) => setSmartsText(e.target.value)}
      placeholder="Paste SMARTS here or upload a file above"
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 8,
        border: "1px solid #ced4da",
        fontSize: 14,
        resize: "vertical",
      }}
    />
  </div>
</div>



      <div style={{ marginTop: 20 }}>
        <button type="submit">Submit Input</button>
      </div>
    </form>
  );
};

export default InputData;
