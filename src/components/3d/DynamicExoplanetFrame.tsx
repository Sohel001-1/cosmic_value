import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useExplorerStore } from '../../store/useExplorerStore';
import { ProceduralExoplanetMesh } from './ProceduralExoplanetMaterial';
import { PlanetLabel } from './PlanetLabel';
import { OrbitPath } from './OrbitPath';
import { CelestialBodyData, StellarParameters } from '../../types/explorer';

interface DynamicFrameProps {
  customBody?: CelestialBodyData;
  customHost?: StellarParameters;
}

export const DynamicExoplanetFrame: React.FC<DynamicFrameProps> = ({ customBody, customHost }) => {
  const storeSelectedBody = useExplorerStore((state) => state.selectedBody);
  const storeHostStar = useExplorerStore((state) => state.hostStar);
  const showOrbits = useExplorerStore((state) => state.showOrbits);
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  const body = customBody || storeSelectedBody;
  const host = customHost || storeHostStar;

  // Only active when a dynamic catalog exoplanet is selected (not Solar System bodies or TOI-700 d)
  const isDynamicExo = body.systemId !== 'solar-system' && body.id !== 'super-earth';

  if (!isDynamicExo) return null;

  const orbitRadius = body.visualScale.orbitRadius;
  const visualRadius = body.visualScale.visualRadius;
  const worldPos = body.visualScale.worldPosition;
  const hasAccurateOrbit = body.visualScale.hasAccurateOrbit;

  return (
    <group position={worldPos}>
      {/* 
        1. LOCAL HOST STAR DIRECTIONAL LIGHT
        Spectral-calibrated to the exoplanet host star's effective temperature / spectral class
      */}
      <directionalLight
        position={[-orbitRadius, 0, 0]}
        color={host.lightColor}
        intensity={host.lightIntensity}
        castShadow={false}
        target={lightTarget}
      />
      <primitive object={lightTarget} position={[0, 0, 0]} />

      {/* 
        2. DYNAMIC CATALOG EXOPLANET PBR MESH
        Distinct procedural visual family based on physical parameters + deterministic per-planet seed
      */}
      <group position={[0, 0, 0]}>
        <ProceduralExoplanetMesh
          body={body}
          radius={visualRadius}
          rotationSpeed={body.visualScale.rotationSpeed}
        />
        <PlanetLabel body={body} />
      </group>

      {/* 
        3. DYNAMIC ORBIT GUIDE
        Only rendered if orbital semi-major axis / period parameters are physically established
      */}
      {showOrbits && hasAccurateOrbit && orbitRadius > 0 && (
        <OrbitPath
          radius={orbitRadius}
          color={host.lightColor}
          opacity={0.10}
          center={[-orbitRadius, 0, 0]}
          targetPosition={[0, 0, 0]}
          targetRadius={visualRadius}
        />
      )}

      {/* 
        4. HOST STAR ANCHOR SPHERE
      */}
      <mesh position={[-orbitRadius, 0, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color={host.lightColor} toneMapped={false} />
      </mesh>
    </group>
  );
};
