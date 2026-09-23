import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

interface PlanetRingMeshProps {
  planetId: string;
  planetRadius: number;
  ringTextureUrl: string;
}

export const PlanetRingMesh: React.FC<PlanetRingMeshProps> = ({
  planetId,
  planetRadius,
  ringTextureUrl,
}) => {
  const ringTexture = useLoader(TextureLoader, ringTextureUrl);

  const { innerRadius, outerRadius, tiltEuler, opacity } = useMemo(() => {
    // Configure radial span and axial tilt based on planetary astronomy
    if (planetId === 'saturn') {
      return {
        innerRadius: planetRadius * 1.28,
        outerRadius: planetRadius * 2.38,
        tiltEuler: new THREE.Euler(THREE.MathUtils.degToRad(26.73), 0, THREE.MathUtils.degToRad(12.0)),
        opacity: 0.92,
      };
    }
    if (planetId === 'uranus') {
      // Extreme axial tilt (97.77 deg) & faint restrained rings
      return {
        innerRadius: planetRadius * 1.35,
        outerRadius: planetRadius * 1.95,
        tiltEuler: new THREE.Euler(THREE.MathUtils.degToRad(97.77), 0, THREE.MathUtils.degToRad(35.0)),
        opacity: 0.38,
      };
    }
    if (planetId === 'neptune') {
      // Faint delicate ring arcs
      return {
        innerRadius: planetRadius * 1.30,
        outerRadius: planetRadius * 1.85,
        tiltEuler: new THREE.Euler(THREE.MathUtils.degToRad(28.32), 0, THREE.MathUtils.degToRad(20.0)),
        opacity: 0.28,
      };
    }
    return {
      innerRadius: planetRadius * 1.3,
      outerRadius: planetRadius * 2.0,
      tiltEuler: new THREE.Euler(0, 0, 0),
      opacity: 0.5,
    };
  }, [planetId, planetRadius]);

  useMemo(() => {
    if (ringTexture) {
      ringTexture.wrapS = THREE.ClampToEdgeWrapping;
      ringTexture.wrapT = THREE.ClampToEdgeWrapping;
      ringTexture.colorSpace = THREE.SRGBColorSpace;
      ringTexture.minFilter = THREE.LinearMipmapLinearFilter;
      ringTexture.magFilter = THREE.LinearFilter;
      ringTexture.generateMipmaps = true;
      ringTexture.needsUpdate = true;
    }
  }, [ringTexture]);

  return (
    <group rotation={tiltEuler}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow={false}
        receiveShadow={false}
        raycast={() => null} // Ring transparency zones must not block planet raycasts
      >
        <ringGeometry args={[innerRadius, outerRadius, 128, 1]} />
        <meshStandardMaterial
          map={ringTexture}
          side={THREE.DoubleSide}
          transparent={true}
          opacity={opacity}
          roughness={0.85}
          metalness={0.0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
