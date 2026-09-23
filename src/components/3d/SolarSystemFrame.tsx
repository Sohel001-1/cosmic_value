import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CELESTIAL_BODIES, STELLAR_HOSTS } from '../../data/explorerCatalog';
import { PlanetRenderer } from './PlanetRenderer';
import { PlanetLabel } from './PlanetLabel';
import { OrbitPath } from './OrbitPath';
import { SunMesh } from './SunMesh';
import { VenusPlanetMesh } from './VenusPlanetMesh';
import { EarthCloudMesh } from './EarthCloudMesh';
import { PlanetRingMesh } from './PlanetRingMesh';
import { useExplorerStore } from '../../store/useExplorerStore';

export const SolarSystemFrame: React.FC = () => {
  const showOrbits = useExplorerStore((state) => state.showOrbits);
  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const departingBody = useExplorerStore((state) => state.departingBody);
  const venusViewMode = useExplorerStore((state) => state.venusViewMode);

  const sunHost = STELLAR_HOSTS['solar-system'];
  const lightTarget = useMemo(() => new THREE.Object3D(), []);

  const sun = CELESTIAL_BODIES['sun'];
  const mercury = CELESTIAL_BODIES['mercury'];
  const venus = CELESTIAL_BODIES['venus'];
  const earth = CELESTIAL_BODIES['earth'];
  const mars = CELESTIAL_BODIES['mars'];
  const jupiter = CELESTIAL_BODIES['jupiter'];
  const saturn = CELESTIAL_BODIES['saturn'];
  const uranus = CELESTIAL_BODIES['uranus'];
  const neptune = CELESTIAL_BODIES['neptune'];
  const pluto = CELESTIAL_BODIES['pluto'];

  const solarBodies = useMemo(
    () => [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto].filter(Boolean),
    [sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto]
  );

  const isActive = selectedBody.systemId === 'solar-system' || departingBody?.systemId === 'solar-system';
  if (!isActive) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* 
        1. LOCAL HOST STAR DIRECTIONAL & POINT LIGHTS (Sun / Sol G2V)
        Dedicated to the Solar System reference frame.
      */}
      <pointLight
        position={[0, 0, 0]}
        color={sunHost.lightColor}
        intensity={sunHost.lightIntensity * 2.2}
        decay={0.0}
        distance={350}
      />
      <directionalLight
        position={[-15, 10, 15]}
        color="#fffaf0"
        intensity={0.65}
        castShadow={false}
        target={lightTarget}
      />
      <primitive object={lightTarget} position={[0, 0, 0]} />

      {/* 
        2. SUN (CENTRAL HOST STAR)
      */}
      <group position={sun.visualScale.worldPosition}>
        <SunMesh
          body={sun}
          radius={sun.visualScale.visualRadius}
          rotationSpeed={sun.visualScale.rotationSpeed}
        />
        <PlanetLabel body={sun} />
      </group>

      {/* 
        3. MERCURY
      */}
      <group position={mercury.visualScale.worldPosition}>
        <PlanetRenderer
          body={mercury}
          radius={mercury.visualScale.visualRadius}
          assets={mercury.assets}
          rotationSpeed={mercury.visualScale.rotationSpeed}
          roughnessValue={0.96}
          metalnessValue={0.0}
        />
        <PlanetLabel body={mercury} />
      </group>

      {/* 
        4. VENUS (Visible Sulfuric Acid Clouds with Radar Topography Mode)
      */}
      <group position={venus.visualScale.worldPosition}>
        <VenusPlanetMesh
          body={venus}
          radius={venus.visualScale.visualRadius}
          rotationSpeed={venus.visualScale.rotationSpeed}
          showRadarSurface={venusViewMode === 'radar'}
          radarTextureUrl={venus.assets.color}
        />
        <PlanetLabel body={venus} />
      </group>

      {/* 
        5. EARTH (Blue Marble Oceans/Continents + Dynamic Rotating Cloud Deck)
      */}
      <group position={earth.visualScale.worldPosition}>
        <PlanetRenderer
          body={earth}
          radius={earth.visualScale.visualRadius}
          assets={earth.assets}
          rotationSpeed={earth.visualScale.rotationSpeed}
          roughnessValue={0.85}
          metalnessValue={0.0}
        />
        {earth.assets.clouds && (
          <EarthCloudMesh
            radius={earth.visualScale.visualRadius}
            cloudTextureUrl={earth.assets.clouds}
          />
        )}
        <PlanetLabel body={earth} />
      </group>

      {/* 
        6. MARS
      */}
      <group position={mars.visualScale.worldPosition}>
        <PlanetRenderer
          body={mars}
          radius={mars.visualScale.visualRadius}
          assets={mars.assets}
          rotationSpeed={mars.visualScale.rotationSpeed}
          roughnessValue={0.94}
          metalnessValue={0.0}
        />
        <PlanetLabel body={mars} />
      </group>

      {/* 
        7. JUPITER (Cassini Atmosphere, Diffuse PBR Scattering)
      */}
      <group position={jupiter.visualScale.worldPosition}>
        <PlanetRenderer
          body={jupiter}
          radius={jupiter.visualScale.visualRadius}
          assets={jupiter.assets}
          rotationSpeed={jupiter.visualScale.rotationSpeed}
          roughnessValue={0.90}
          metalnessValue={0.0}
        />
        <PlanetLabel body={jupiter} />
      </group>

      {/* 
        8. SATURN (Cassini Bands + High-Fidelity Ring Transparency)
      */}
      <group position={saturn.visualScale.worldPosition}>
        <PlanetRenderer
          body={saturn}
          radius={saturn.visualScale.visualRadius}
          assets={saturn.assets}
          rotationSpeed={saturn.visualScale.rotationSpeed}
          roughnessValue={0.90}
          metalnessValue={0.0}
        />
        {saturn.assets.rings && (
          <PlanetRingMesh
            planetId="saturn"
            planetRadius={saturn.visualScale.visualRadius}
            ringTextureUrl={saturn.assets.rings}
          />
        )}
        <PlanetLabel body={saturn} />
      </group>

      {/* 
        9. URANUS (Cyan Atmosphere + 97.8° Axial Tilt Rings)
      */}
      <group position={uranus.visualScale.worldPosition}>
        <PlanetRenderer
          body={uranus}
          radius={uranus.visualScale.visualRadius}
          assets={uranus.assets}
          rotationSpeed={uranus.visualScale.rotationSpeed}
          roughnessValue={0.92}
          metalnessValue={0.0}
        />
        {uranus.assets.rings && (
          <PlanetRingMesh
            planetId="uranus"
            planetRadius={uranus.visualScale.visualRadius}
            ringTextureUrl={uranus.assets.rings}
          />
        )}
        <PlanetLabel body={uranus} />
      </group>

      {/* 
        10. NEPTUNE (Azure Atmosphere + Faint Ring Arcs)
      */}
      <group position={neptune.visualScale.worldPosition}>
        <PlanetRenderer
          body={neptune}
          radius={neptune.visualScale.visualRadius}
          assets={neptune.assets}
          rotationSpeed={neptune.visualScale.rotationSpeed}
          roughnessValue={0.92}
          metalnessValue={0.0}
        />
        {neptune.assets.rings && (
          <PlanetRingMesh
            planetId="neptune"
            planetRadius={neptune.visualScale.visualRadius}
            ringTextureUrl={neptune.assets.rings}
          />
        )}
        <PlanetLabel body={neptune} />
      </group>

      {/* 
        11. PLUTO (Dwarf Planet / Kuiper Belt)
      */}
      <group position={pluto.visualScale.worldPosition}>
        <PlanetRenderer
          body={pluto}
          radius={pluto.visualScale.visualRadius}
          assets={pluto.assets}
          rotationSpeed={pluto.visualScale.rotationSpeed}
          roughnessValue={0.94}
          metalnessValue={0.0}
        />
        <PlanetLabel body={pluto} />
      </group>

      {/* 
        12. SOLAR SYSTEM CONCENTRIC ORBIT PATH GUIDES
      */}
      {showOrbits &&
        solarBodies.map((b) => {
          if (b.visualScale.orbitRadius <= 0) return null;
          return (
            <OrbitPath
              key={`orbit-${b.id}`}
              radius={b.visualScale.orbitRadius}
              color={b.id === 'pluto' ? '#cbd5e1' : '#94a3b8'}
              opacity={b.id === 'pluto' ? 0.08 : 0.12}
              center={[0, 0, 0]}
              targetPosition={b.visualScale.worldPosition}
              targetRadius={b.visualScale.visualRadius}
            />
          );
        })}
    </group>
  );
};
