type Props = {
  type: "text" | "file";
  setType: (val: "text" | "file") => void;
  text: string;
  setText: (val: string) => void;
  setFile: (file: File | null) => void;
};

const SmilesInput: React.FC<Props> = ({ type, setType, text, setText, setFile }) => (
  <div style={{ flex: 1, border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
    <h3>SMILES Input</h3>
    <label>
      <input type="radio" checked={type === "text"} onChange={() => setType("text")} />
      Text
    </label>
    <label style={{ marginLeft: 12 }}>
      <input type="radio" checked={type === "file"} onChange={() => setType("file")} />
      File
    </label>

    <div style={{ marginTop: 8 }}>
      {type === "text" ? (
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste SMILES here..."
          style={{ width: "100%", padding: 8 }}
        />
      ) : (
        <input type="file" accept=".smi,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      )}
    </div>
  </div>
);

export default SmilesInput;
