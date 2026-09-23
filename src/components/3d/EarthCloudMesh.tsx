import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

interface EarthCloudMeshProps {
  radius: number;
  cloudTextureUrl: string;
}

export const EarthCloudMesh: React.FC<EarthCloudMeshProps> = ({
  radius,
  cloudTextureUrl,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudTexture = useLoader(TextureLoader, cloudTextureUrl);

  useMemo(() => {
    if (cloudTexture) {
      cloudTexture.wrapS = THREE.RepeatWrapping;
      cloudTexture.wrapT = THREE.ClampToEdgeWrapping;
      // Greyscale cloud map used as linear alpha mask (black = 0% alpha / clear sky, white = 100% alpha / cloud)
      cloudTexture.colorSpace = THREE.NoColorSpace;
      cloudTexture.generateMipmaps = true;
      cloudTexture.minFilter = THREE.LinearMipmapLinearFilter;
      cloudTexture.magFilter = THREE.LinearFilter;
      cloudTexture.needsUpdate = true;
    }
  }, [cloudTexture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Atmospheric super-rotation: clouds rotate slightly faster than the terrestrial crust
      meshRef.current.rotation.y += delta * 0.0042;
    }
  });

  return (
    <mesh
      ref={meshRef}
      castShadow={false}
      receiveShadow={false}
      raycast={() => null} // Transparent cloud layer must never intercept raycasts / pointer events intended for Earth's globe
    >
      <sphereGeometry args={[radius * 1.012, 128, 128]} />
      <meshStandardMaterial
        color="#ffffff"
        alphaMap={cloudTexture}
        transparent={true}
        opacity={0.88}
        roughness={0.90}
        metalness={0.0}
        depthWrite={false}
      />
    </mesh>
  );
};
