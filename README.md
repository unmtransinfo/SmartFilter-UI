# SmartFilter-UI

SmartFilter-UI is a modern web interface for molecular filtering and analysis using SMARTS patterns.  
It provides researchers, chemoinformaticians, and developers with an interactive way to test compounds against well-established substructure filters such as **PAINS, Blake, Glaxo, ALARM NMR, Oprea, Toxicity, and MLSMR**.

Built with **React + TypeScript + Vite** and powered by **RDKit.js**, SmartFilter-UI integrates seamlessly with the **SmartFilter API**.

---

## Screenshot

![SmartFilter-UI Screenshot](/docs/images/smartfilter-ui.png)

---

## Features

- **Filter Mode** – Test a set of molecules against selected filters and inspect failed matches.  
- **Analyze One Molecule Mode** – Evaluate a single molecule against all filters with detailed matches.  
- **Supported SMARTS Sets:**
  - **PAINS** – Pan-Assay Interference Compounds (Baell & Holloway, 2010).  
  - **Blake** – From Array Biopharma (translated from SLN to SMARTS).  
  - **Glaxo** – Includes unsuitable leads, natural products, reactive subsets, acids/bases, electrophilic, and nucleophilic subsets.  
  - **ALARM NMR** – Abbott method for detecting reactive false positives.  
  - **Oprea** – Multi-objective library fitness filters.  
  - **Toxicity** – Based on published toxicophores.  
  - **MLSMR** – NIH Roadmap screening filters.  
- **Expert Mode Options** – Configure output with “Show Matches,” “Include Passes,” “Include Fails,” “Strict Mode,” etc.  
- **Batch Processing** – Upload SMILES files and process thousands of molecules.  
- **Visualization** – Molecules rendered via **RDKit.js** with highlighted substructure matches.  
- **Modern UI** – Built with **Vite, React, TailwindCSS**, and **Docker-ready**.  

---

## Example

Visit the live app here: [SmartFilter-UI Deployment](https://chiltepin.health.unm.edu/smartsfilter/)  

API Reference: [SmartFilter API](https://github.com/unmtransinfo/SmartsFilter-API)  

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite  
- **Cheminformatics:** RDKit.js  
- **Styling:** TailwindCSS, ShadCN/UI  
- **Deployment:** Docker + Apache  
- **API:** SmartFilter API  

---

## Installation & Development

Clone and run locally:

```bash
git clone https://github.com/unmtransinfo/SmartFilter-UI.git
cd SmartFilter-UI
npm install
npm run dev
```

App runs at: [http://localhost:5173/smartsfilter](http://localhost:5173/smartsfilter)  

---

## Docker Setup

Build and run with Docker:

```bash
docker build -t smartfilter-ui .
docker run -p 5173:5173 smartfilter-ui
```

---

## Acknowledgments

- **Supervision:** Jeremy Yang  
- **Developer:** Bivek Sharma Panthi  
- **Supporter:** Jack Ringer  
- Some UI ideas adapted from **Badapple2-UI**.  
- Thanks to **RDKit.js** for cheminformatics functionality.  

---

## License

This project is licensed under the **BSD-3-Clause License**.

---

## Audience

This project is intended for:

- **Researchers** – to filter out problematic compounds in screening libraries.  
- **Developers** – to integrate filtering pipelines into cheminformatics workflows.  
- **Students & Educators** – as an example of cheminformatics web app development with RDKit.js.  