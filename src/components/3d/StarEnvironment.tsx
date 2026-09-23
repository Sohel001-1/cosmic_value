import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export const StarEnvironment: React.FC = () => {
  // Load the Milky Way panorama
  const starTexture = useLoader(TextureLoader, '/assets/environments/stars/color.webp');
  starTexture.colorSpace = THREE.SRGBColorSpace;
  starTexture.mapping = THREE.EquirectangularReflectionMapping;

  // Generate crisp, fixed background starfield particles (1,500 subtle pin-points)
  const starCount = 1500;
  const [starPositions, starColors] = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color('#e2e8f0'), // Soft white
      new THREE.Color('#f8fafc'), // Pure white
      new THREE.Color('#cbd5e1'), // Muted silver
      new THREE.Color('#fed7aa'), // Warm amber star
      new THREE.Color('#bae6fd'), // Ice blue star
    ];

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 400 + Math.random() * 300;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, []);

  return (
    <group>
      {/* 
        1. DEEP SPACE BACKDROP SPHERE (NASA Eyes 85-95% black restraint)
        Milky Way opacity kept very low (0.28) with a dark charcoal background 
        so it never overpowers the scene.
      */}
      <mesh>
        <sphereGeometry args={[800, 64, 32]} />
        <meshBasicMaterial
          map={starTexture}
          side={THREE.BackSide}
          toneMapped={false}
          transparent={true}
          opacity={0.28}
          color="#161a24" // Deep muted tint
          depthWrite={false}
        />
      </mesh>

      {/* 
        2. CRISP FIXED STAR PARTICLES
        Completely static at planetary scale — no distracting rotation drift.
      */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={starPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starCount}
            array={starColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.1}
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
