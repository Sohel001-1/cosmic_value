import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { StarEnvironment } from './StarEnvironment';
import { LightingSystem } from './LightingSystem';
import { SolarSystemFrame } from './SolarSystemFrame';
import { TOI700SystemFrame } from './TOI700SystemFrame';
import { DynamicExoplanetFrame } from './DynamicExoplanetFrame';
import { CameraController } from './CameraController';
import { useExplorerStore } from '../../store/useExplorerStore';

export const UniverseScene: React.FC = () => {
  const loadCatalog = useExplorerStore((state) => state.loadCatalog);
  const isTransitioning = useExplorerStore((state) => state.isTransitioning);
  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const departingBody = useExplorerStore((state) => state.departingBody);
  const departingHost = useExplorerStore((state) => state.departingHost);

  // Preload catalog data asynchronously in background on mount
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const hasDistinctDepartingExo =
    isTransitioning &&
    departingBody &&
    departingHost &&
    departingBody.id !== selectedBody.id &&
    departingBody.id !== 'mercury' &&
    departingBody.id !== 'super-earth';

  return (
    <div className="universe-viewport">
      <Canvas
        camera={{
          position: [0, 48, 72],
          fov: 38, // Narrower cinematic planetary perspective (NASA Eyes style)
          near: 0.5,
          far: 4500,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05, // Rich contrast for crater ejecta and mineral albedo
          powerPreference: 'high-performance',
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
      >
        <Suspense fallback={null}>
          {/* Deep Space Background with Fixed Pinpoint Stars */}
          <StarEnvironment />

          {/* Universal Ambient Lighting */}
          <LightingSystem />

          {/* 
            STELLAR REFERENCE FRAMES
            1. SolarSystemFrame: Mercury in the Solar System at [0, 0, 0]
            2. TOI700SystemFrame: Curated high-fidelity TOI-700 d at [40, 4, -25]
            3. DynamicExoplanetFrame: Dynamically mounted system for destination catalog exoplanet
            4. Departing DynamicExoplanetFrame: Holds the outgoing world during travel
          */}
          <SolarSystemFrame />
          <TOI700SystemFrame />
          <DynamicExoplanetFrame />

          {hasDistinctDepartingExo && (
            <DynamicExoplanetFrame
              customBody={departingBody}
              customHost={departingHost}
            />
          )}

          {/* Smooth Camera Controller */}
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
};
