import React, { useEffect, useRef, useState } from "react";

type MolImageProps = {
  smiles: string;
  format?: "svg" | "png";
  width?: number | string;
  height?: number | string;
  highlightAtoms?: number[];
};

const MolImage: React.FC<MolImageProps> = ({
  smiles,
  format = "svg",
  width = "100%",
  height = "auto",
  highlightAtoms = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [RDKit, setRDKit] = useState<any>(null);
  const [svgData, setSvgData] = useState<string>("");

  // Load RDKit from window (unpkg)
  useEffect(() => {
    const waitRDKit = async () => {
      if ((window as any).RDKit) {
        const RDKitModule = await (window as any).RDKit();
        setRDKit(RDKitModule);
        console.log("RDKit.js initialized!");
      } else {
        console.error("RDKit.js not loaded. Did you include the unpkg script?");
      }
    };
    waitRDKit();
  }, []);

  useEffect(() => {
    if (!RDKit || !smiles?.trim()) {
      setSvgData("");
      return;
    }

    try {
      const mol = RDKit.get_mol(smiles);
      if (!mol) throw new Error("Failed to parse molecule");

      if (format === "png" && canvasRef.current) {
        const options: any = {};
        if (highlightAtoms.length > 0) options.highlightAtoms = highlightAtoms;
        mol.draw_to_canvas(canvasRef.current, options);
        setSvgData("");
      } else {
        let svg = "";
        if (highlightAtoms.length > 0) {
          svg = mol.get_svg_with_highlights(
            JSON.stringify({ atoms: highlightAtoms })
          );
        } else {
          svg = mol.get_svg();
        }
        setSvgData(svg);
      }

      mol.delete();
    } catch (err) {
      console.warn("MolImage rendering failed for SMILES:", smiles, err);
      setSvgData(`<text x="10" y="50" fill="red">⚠️ Invalid SMILES</text>`);
    }
  }, [RDKit, smiles, format, highlightAtoms]);

  if (!smiles) return <p>No SMILES provided</p>;

  return (
    <>
      {!RDKit ? (
        <p className="text-muted">Loading molecule...</p>
      ) : format === "png" ? (
        <canvas
          ref={canvasRef}
          width={typeof width === "number" ? width : 120}
          height={typeof height === "number" ? height : 80}
        />
      ) : (
        <div
          dangerouslySetInnerHTML={{ __html: svgData }}
          style={{
            width: typeof width === "string" ? width : `${width}px`,
            height: typeof height === "string" ? height : `${height}px`,
            overflow: "hidden",
          }}
        />
      )}
    </>
  );
};

export default MolImage;
