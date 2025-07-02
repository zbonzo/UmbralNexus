import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import { LandingPage } from './pages/LandingPage';

const App = () => {
  return <LandingPage />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);