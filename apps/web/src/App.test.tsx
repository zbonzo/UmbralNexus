import { render, screen } from '@testing-library/react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-umbral-400 mb-4">Umbral Nexus</h1>
        <p className="text-xl text-gray-300">Coming Soon!</p>
      </div>
    </div>
  );
};

describe('App', () => {
  it('renders coming soon message', () => {
    render(<App />);
    const heading = screen.getByText(/Umbral Nexus/i);
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Coming Soon!/i)).toBeInTheDocument();
  });
});