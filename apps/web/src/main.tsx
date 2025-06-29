import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-umbral-400 mb-4">Umbral Nexus</h1>
        <p className="text-xl text-gray-300">Coming Soon...</p>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);