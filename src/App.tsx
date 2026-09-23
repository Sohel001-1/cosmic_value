import React from 'react';
import { UniverseScene } from './components/3d/UniverseScene';
import { ExplorerHUD } from './components/ui/ExplorerHUD';
import { PlanetInfoPanel } from './components/ui/PlanetInfoPanel';
import { PerformanceDiagnostics } from './components/ui/PerformanceDiagnostics';

export const App: React.FC = () => {
  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* 3D Universe Viewport */}
      <UniverseScene />

      {/* Primary Minimal Translucent Navigation Overlays */}
      <ExplorerHUD />

      {/* Floating Scientific Data Panel */}
      <PlanetInfoPanel />

      {/* Developer Diagnostics Overlay */}
      <PerformanceDiagnostics />
    </main>
  );
};

export default App;
