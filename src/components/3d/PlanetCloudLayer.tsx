import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';

interface PlanetCloudLayerProps {
  radius: number;
  cloudsUrl: string;
  rotationSpeed?: number;
  opacity?: number;
}

export const PlanetCloudLayer: React.FC<PlanetCloudLayerProps> = ({
  radius,
  cloudsUrl,
  rotationSpeed = 0.006,
  opacity = 0.48, // Restrained physical cloud opacity
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const cloudTexture = useLoader(TextureLoader, cloudsUrl);

  useEffect(() => {
    if (cloudTexture) {
      cloudTexture.colorSpace = THREE.SRGBColorSpace;
      cloudTexture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
      cloudTexture.wrapS = THREE.RepeatWrapping;
      cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
      cloudTexture.needsUpdate = true;
    }
  }, [cloudTexture, gl]);

  // Differential atmospheric drift
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef} scale={[1.014, 1.014, 1.014]}>
      <sphereGeometry args={[radius, 96, 96]} />
      <meshStandardMaterial
        map={cloudTexture}
        transparent={true}
        opacity={opacity}
        blending={THREE.NormalBlending} // Physical alpha blending (NOT additive)
        depthWrite={false}
        roughness={0.98}
        metalness={0.0}
        color="#e2e8f0" // Neutral off-white/gray clouds
      />
    </mesh>
  );
};
