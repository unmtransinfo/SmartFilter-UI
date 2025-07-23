import React, { useEffect, useState } from 'react';
import initRDKitModule from '@rdkit/rdkit';
import { MatchResult } from '../App';

type Props = {
  matchCounts: MatchResult[];
  mode: string;
  totalMatched: number;
};

const SmartsFilterResult: React.FC<Props> = ({ matchCounts, mode, totalMatched }) => {
  const [RDKit, setRDKit] = useState<any>(null);
  const [showMatches, setShowMatches] = useState(true);
  const [includePasses, setIncludePasses] = useState(true);
  const [includeFails, setIncludeFails] = useState(true);
  const [depict, setDepict] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    initRDKitModule({ locateFile: () => '/RDKit_minimal.wasm' })
      .then((RDKitModule: any) => setRDKit(RDKitModule))
      .catch(console.error);
  }, []);

  const renderSVG = (smiles: string) => {
    if (!RDKit) return <div>Loading...</div>;
    try {
      const mol = RDKit.get_mol(smiles);
      const svg = mol.get_svg();
      mol.delete();
      return <div dangerouslySetInnerHTML={{ __html: svg }} />;
    } catch {
      return <div>Error</div>;
    }
  };

  // Filtered list based on passes/fails
  const filtered = matchCounts.filter(m => {
    if (m.matched && !includePasses) return false;
    if (!m.matched && !includeFails) return false;
    return true;
  });

  // Selected detailed molecule for analyze1mol
  const detail = mode === 'analyze1mol' && matchCounts[currentIndex];

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-white bg-gradient-to-r from-blue-600 to-teal-400 p-2 rounded">SMARTS Filters Results</h3>
      </div>

      {mode === 'analyze1mol' && detail ? (
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-header bg-gradient-to-r from-purple-500 to-pink-500 text-white">Molecule Detail</div>
              <div className="card-body text-center">
                {depict && renderSVG(detail.SMILES)}
                <h5 className="mt-2">{detail.name}</h5>
                <p>Result: <strong className={detail.matched ? 'text-danger' : 'text-success'}>{detail.matched ? 'Fail' : 'Pass'}</strong></p>
                <p>Total matches: {detail.matches?.filter(Boolean).length}</p>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-sm btn-outline-primary" disabled={currentIndex===0} onClick={() => setCurrentIndex(currentIndex-1)}>Prev</button>
                  <button className="btn btn-sm btn-outline-primary" disabled={currentIndex===matchCounts.length-1} onClick={() => setCurrentIndex(currentIndex+1)}>Next</button>
                </div>
              </div>
            </div>
            {showMatches && detail.matches && (
              <table className="table table-sm table-bordered">
                <thead className="table-secondary">
                  <tr>
                    <th>#</th><th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.matches.map((m,i) => (
                    <tr key={i} className={m ? 'table-success':'table-danger'}>
                      <td>{i+1}</td><td>{m?'✓':'✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="col-md-8">
            <h5>Other Molecules</h5>
            <table className="table table-striped table-hover">
              <thead>
                <tr><th>#</th><th>Name</th><th>Result</th></tr>
              </thead>
              <tbody>
                {filtered.map((m,i)=>(
                  <tr key={i} onClick={()=>setCurrentIndex(matchCounts.indexOf(m))} style={{cursor:'pointer'}}>
                    <td>{i+1}</td>
                    <td>{m.name}</td>
                    <td className={m.matched?'text-danger':'text-success'}>{m.matched?'Fail':'Pass'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr><th>#</th><th>Name</th><th>Result</th></tr>
            </thead>
            <tbody>
              {filtered.map((m,i)=>(
                <tr key={i}>
                  <td>{i+1}</td>
                  <td>{m.name}</td>
                  <td className={m.matched?'text-danger':'text-success'}>{m.matched?'Fail':'Pass'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-2 text-muted">Total molecules: {filtered.length} / {totalMatched}</div>
    </div>
  );
};

export default SmartsFilterResult;
