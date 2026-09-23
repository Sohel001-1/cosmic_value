import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CELESTIAL_BODIES, STELLAR_HOSTS } from '../../data/explorerCatalog';
import { PlanetRenderer } from './PlanetRenderer';
import { PlanetCloudLayer } from './PlanetCloudLayer';
import { PlanetLabel } from './PlanetLabel';
import { OrbitPath } from './OrbitPath';
import { useExplorerStore } from '../../store/useExplorerStore';

export const TOI700SystemFrame: React.FC = () => {
  const showOrbits = useExplorerStore((state) => state.showOrbits);
  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const departingBody = useExplorerStore((state) => state.departingBody);
  const toi700d = CELESTIAL_BODIES['super-earth'];
  const hostStar = STELLAR_HOSTS['toi-700'];
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  // Render when TOI-700 d is either destination or departing world
  const isTOI700Active =
    selectedBody.id === 'super-earth' ||
    selectedBody.name === 'TOI-700 d' ||
    departingBody?.id === 'super-earth' ||
    departingBody?.name === 'TOI-700 d';

  if (!isTOI700Active) return null;

  return (
    <group position={[40, 4, -25]}>
      {/* 
        1. LOCAL HOST STAR DIRECTIONAL LIGHT (TOI-700 M2V Dwarf)
        Dedicated to TOI-700 System reference frame.
      */}
      <directionalLight
        position={[-toi700d.visualScale.orbitRadius, 0, 0]}
        color={hostStar.lightColor}
        intensity={hostStar.lightIntensity}
        castShadow={false}
        target={lightTarget}
      />
      <primitive object={lightTarget} position={[0, 0, 0]} />

      {/* 
        2. TOI-700 d EXOPLANET
        Authentic matte rocky basalt/silicate world (roughness: 0.94, metalness: 0.0),
        crisp geological hierarchy, no artificial separate glowing shell.
      */}
      <group position={[0, 0, 0]}>
        <PlanetRenderer
          radius={toi700d.visualScale.visualRadius}
          assets={toi700d.assets}
          rotationSpeed={toi700d.visualScale.rotationSpeed}
          roughnessValue={0.94}
          metalnessValue={0.0}
        />

        {/* Subtle, non-obscuring wispy cloud layer (optional, very low opacity) */}
        {toi700d.assets.clouds && (
          <PlanetCloudLayer
            radius={toi700d.visualScale.visualRadius}
            cloudsUrl={toi700d.assets.clouds}
            rotationSpeed={toi700d.visualScale.rotationSpeed * 1.4}
            opacity={0.10}
          />
        )}

        {/* Minimal Planet Label */}
        <PlanetLabel body={toi700d} />
      </group>

      {/* 
        3. TOI-700 d ORBIT PATH (Hairline around TOI-700 host star)
      */}
      {showOrbits && toi700d.visualScale.orbitRadius > 0 && (
        <OrbitPath
          radius={toi700d.visualScale.orbitRadius}
          color="#ffd1a4"
          opacity={0.10}
          center={[-toi700d.visualScale.orbitRadius, 0, 0]}
          targetPosition={[0, 0, 0]}
          targetRadius={toi700d.visualScale.visualRadius}
        />
      )}

      {/* 
        4. TOI-700 M-DWARF STAR ANCHOR
      */}
      <mesh position={[-toi700d.visualScale.orbitRadius, 0, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshBasicMaterial color="#ff9e64" toneMapped={false} />
      </mesh>
    </group>
  );
};
