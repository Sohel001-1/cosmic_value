import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CelestialBodyData } from '../../types/explorer';
import { useExplorerStore } from '../../store/useExplorerStore';

interface SunMeshProps {
  body?: CelestialBodyData;
  radius: number;
  rotationSpeed?: number;
  onHoverChange?: (hovered: boolean) => void;
}

export const SunMesh: React.FC<SunMeshProps> = ({
  body,
  radius,
  rotationSpeed = 0.0015,
  onHoverChange,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);
  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 });
  const selectBody = useExplorerStore((state) => state.selectBody);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z += delta * 0.0008;
    }
  });

  const handlePointerDown = (e: any) => {
    pointerDownPos.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const handlePointerUp = (e: any) => {
    const dx = e.clientX - pointerDownPos.current.x;
    const dy = e.clientY - pointerDownPos.current.y;
    const dt = Date.now() - pointerDownPos.current.time;
    if (Math.hypot(dx, dy) < 6 && dt < 500 && body) {
      e.stopPropagation();
      selectBody(body.id);
    }
  };

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onHoverChange?.(true);
  };

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto';
    onHoverChange?.(false);
  };

  return (
    <group>
      {/* 1. Photosphere Sphere (Warm radiant stellar core) */}
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow={false}
        receiveShadow={false}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial
          color="#fffdf5"
          toneMapped={false}
        />
      </mesh>

      {/* 2. Inner Solar Chromosphere / Corona Glow (Soft Additive Blend, FrontSide) */}
      <mesh
        ref={coronaRef}
        castShadow={false}
        receiveShadow={false}
        raycast={() => null}
      >
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#fed7aa"
          transparent={true}
          opacity={0.25}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Diffuse Solar Halo */}
      <mesh
        castShadow={false}
        receiveShadow={false}
        raycast={() => null}
      >
        <sphereGeometry args={[radius * 1.35, 32, 32]} />
        <meshBasicMaterial
          color="#ffedd5"
          transparent={true}
          opacity={0.10}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
