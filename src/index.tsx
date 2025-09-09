import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { Buffer } from 'buffer';
import process from 'process';

window.Buffer = Buffer;
window.process = process;

const container = document.getElementById('root');
if (!container) throw new Error("Root container missing in index.html");

const root = ReactDOM.createRoot(container);
root.render(<App />);

reportWebVitals();
