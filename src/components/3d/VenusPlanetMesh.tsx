import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { hashString, createRNG } from '../../utils/exoplanetAdapter';
import { CelestialBodyData } from '../../types/explorer';
import { useExplorerStore } from '../../store/useExplorerStore';

interface VenusPlanetMeshProps {
  body?: CelestialBodyData;
  radius: number;
  rotationSpeed?: number;
  showRadarSurface?: boolean;
  radarTextureUrl?: string;
  onHoverChange?: (hovered: boolean) => void;
}

// Generate an authentic visible-light sulfuric acid cloud texture for Venus
function generateVenusVisibleCloudTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const rng = createRNG(hashString('venus_visible_atmosphere'));

  // Venus natural visible spectrum palette: soft pale butter-cream, warm sulfuric yellow-white, subtle polar shading
  const cTop = { r: 246, g: 240, b: 228 };    // High-albedo bright cloud deck
  const cMid = { r: 235, g: 224, b: 200 };    // Equatorial haze
  const cDark = { r: 215, g: 198, b: 168 };   // Subtle UV absorption wave feature

  for (let y = 0; y < height; y++) {
    const v = y / height;
    const lat = (v - 0.5) * Math.PI;

    for (let x = 0; x < width; x++) {
      const u = x / width;

      // Venus super-rotating chevron wave pattern in upper cloud deck
      const chevron = Math.abs(lat) * 0.8 + Math.sin(u * Math.PI * 4.0) * 0.15;
      const band = Math.cos(lat * 3.0) * 0.25;
      const micro = (Math.sin(u * 20.0 + v * 15.0) * 0.05);

      const signal = Math.max(0, Math.min(1, 0.5 + chevron * 0.3 + band + micro));

      // Interpolate sulfuric acid tones
      const r = THREE.MathUtils.lerp(cTop.r, cDark.r, signal * 0.7);
      const g = THREE.MathUtils.lerp(cTop.g, cDark.g, signal * 0.7);
      const b = THREE.MathUtils.lerp(cTop.b, cDark.b, signal * 0.7);

      // Polar hood limb darkening
      const polarFactor = Math.max(0.72, Math.cos(lat * 0.95));

      const idx = (y * width + x) * 4;
      data[idx] = Math.round(r * polarFactor);
      data[idx + 1] = Math.round(g * polarFactor);
      data[idx + 2] = Math.round(b * polarFactor);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const VenusPlanetMesh: React.FC<VenusPlanetMeshProps> = ({
  body,
  radius,
  rotationSpeed = -0.001,
  showRadarSurface = false,
  radarTextureUrl = '/assets/solar-system/venus/color.webp',
  onHoverChange,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const visibleTexture = useMemo(() => generateVenusVisibleCloudTexture(), []);
  const radarTexture = useLoader(TextureLoader, radarTextureUrl);
  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 });
  const selectBody = useExplorerStore((state) => state.selectBody);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  const activeTexture = showRadarSurface ? radarTexture : visibleTexture;

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
    <mesh
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow={false}
      receiveShadow={false}
    >
      <sphereGeometry args={[radius, 128, 128]} />
      <meshStandardMaterial
        map={activeTexture}
        roughness={showRadarSurface ? 0.94 : 0.88}
        metalness={0.0}
      />
    </mesh>
  );
};
