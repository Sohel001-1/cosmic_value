import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { AssetMapCollection, CelestialBodyData } from '../../types/explorer';
import { AssetMapTextureProvider, TextureLODLevel } from './PlanetTextureProvider';
import { useExplorerStore } from '../../store/useExplorerStore';

interface PlanetRendererProps {
  body?: CelestialBodyData;
  radius: number;
  assets: AssetMapCollection;
  rotationSpeed?: number;
  roughnessValue?: number;
  metalnessValue?: number;
  onHoverChange?: (hovered: boolean) => void;
}

export const PlanetRenderer: React.FC<PlanetRendererProps> = ({
  body,
  radius,
  assets,
  rotationSpeed = 0.003,
  roughnessValue = 0.96,
  metalnessValue = 0.0,
  onHoverChange,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const { gl } = useThree();
  const [colorMap, setColorMap] = useState<THREE.Texture | null>(null);

  const activeLevel = useRef<TextureLODLevel>('DISTANT');
  const requestedLevel = useRef<TextureLODLevel | null>(null);
  const requestSequence = useRef(0);
  const worldPosition = useMemo(() => new THREE.Vector3(), []);
  const lastDiagUpdateTime = useRef(0);
  const pointerDownPos = useRef({ x: 0, y: 0, time: 0 });

  const selectBody = useExplorerStore((state) => state.selectBody);
  const updateDiagnostics = useExplorerStore((state) => state.updateDiagnostics);

  const textureProvider = useMemo(
    () =>
      new AssetMapTextureProvider(
        { preview: assets.preview, color: assets.color, high: assets.high },
        gl
      ),
    [assets.preview, assets.color, assets.high, gl]
  );

  // Load normal map if specified (numerical data - strictly NoColorSpace)
  const normalMap = useLoader(
    TextureLoader,
    assets.normal || '/assets/procedural/rocky/preview.webp'
  );

  // Load roughness map if specified (numerical data - strictly NoColorSpace)
  const roughnessMap = useLoader(
    TextureLoader,
    assets.roughness || '/assets/procedural/rocky/preview.webp'
  );

  // Initial distant texture load
  useEffect(() => {
    let mounted = true;
    const initialRequest = ++requestSequence.current;
    requestedLevel.current = 'DISTANT';

    updateDiagnostics({
      textureLoadStatus: 'Streaming Asynchronous LOD...',
      gpuMaxTextureSize: gl.capabilities.maxTextureSize,
      supports8KClose: Boolean(assets.high) && gl.capabilities.maxTextureSize >= 8192,
    });

    textureProvider.getTexture('DISTANT').then((result) => {
      if (!mounted || initialRequest !== requestSequence.current) return;
      activeLevel.current = 'DISTANT';
      requestedLevel.current = null;
      setColorMap(result.texture);

      updateDiagnostics({
        activeLODLevel: 'DISTANT',
        textureDimensions: `${result.width} × ${result.height} px (Preview LOD)`,
        textureLoadStatus: 'Ready (Cached)',
      });
    });

    return () => {
      mounted = false;
      textureProvider.dispose();
    };
  }, [textureProvider, assets.high, gl, updateDiagnostics]);

  // Configure normal & roughness maps
  useEffect(() => {
    const maxAnisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());

    if (assets.normal && normalMap) {
      normalMap.colorSpace = THREE.NoColorSpace;
      normalMap.anisotropy = maxAnisotropy;
      normalMap.wrapS = THREE.RepeatWrapping;
      normalMap.wrapT = THREE.ClampToEdgeWrapping;
      normalMap.needsUpdate = true;
    }

    if (assets.roughness && roughnessMap) {
      roughnessMap.colorSpace = THREE.NoColorSpace;
      roughnessMap.anisotropy = maxAnisotropy;
      roughnessMap.wrapS = THREE.RepeatWrapping;
      roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
      roughnessMap.needsUpdate = true;
    }
  }, [normalMap, roughnessMap, assets.normal, assets.roughness, gl]);

  useEffect(() => {
    if (materialRef.current) materialRef.current.needsUpdate = true;
  }, [colorMap]);

  useFrame(({ camera, clock }, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;

      meshRef.current.getWorldPosition(worldPosition);
      const distanceInUnits = camera.position.distanceTo(worldPosition);
      const distanceInRadii = distanceInUnits / radius;
      const supportsHighTexture = Boolean(assets.high) && gl.capabilities.maxTextureSize >= 8192;

      // LOD Evaluation with Hysteresis
      let desiredLevel: TextureLODLevel = activeLevel.current;

      if (activeLevel.current === 'DISTANT') {
        if (distanceInRadii <= 7.0) {
          desiredLevel = distanceInRadii <= 4.2 && supportsHighTexture ? 'CLOSE' : 'ORBITAL';
        }
      } else if (activeLevel.current === 'ORBITAL') {
        if (distanceInRadii > 8.0) {
          desiredLevel = 'DISTANT';
        } else if (distanceInRadii <= 4.2 && supportsHighTexture) {
          desiredLevel = 'CLOSE';
        }
      } else if (activeLevel.current === 'CLOSE') {
        if (distanceInRadii > 8.0) {
          desiredLevel = 'DISTANT';
        } else if (distanceInRadii > 4.8 || !supportsHighTexture) {
          desiredLevel = 'ORBITAL';
        }
      }

      if (desiredLevel !== activeLevel.current && desiredLevel !== requestedLevel.current) {
        requestedLevel.current = desiredLevel;
        const requestId = ++requestSequence.current;

        updateDiagnostics({
          textureLoadStatus: 'Streaming Asynchronous LOD...',
        });

        textureProvider.getTexture(desiredLevel).then((result) => {
          if (requestId !== requestSequence.current) return;
          activeLevel.current = desiredLevel;
          requestedLevel.current = null;
          setColorMap(result.texture);

          const lodLabel =
            result.level === 'CLOSE' && result.width >= 8192
              ? `${result.width} × ${result.height} px (8K Texture)`
              : result.level === 'ORBITAL' && result.width >= 4096
              ? `${result.width} × ${result.height} px (4K Texture)`
              : `${result.width} × ${result.height} px (${result.level} LOD)`;

          updateDiagnostics({
            activeLODLevel: desiredLevel,
            textureDimensions: lodLabel,
            textureLoadStatus: 'Ready (Cached)',
          });
        });
      }

      const now = clock.getElapsedTime();
      if (now - lastDiagUpdateTime.current > 0.1) {
        lastDiagUpdateTime.current = now;
        updateDiagnostics({
          cameraDistanceRadii: Number(distanceInRadii.toFixed(2)),
          cameraDistanceUnits: Number(distanceInUnits.toFixed(2)),
        });
      }
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
    // Disambiguate orbit drag from intentional click
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
        ref={materialRef}
        map={colorMap}
        normalMap={assets.normal ? normalMap : null}
        normalScale={assets.normal ? new THREE.Vector2(1.2, 1.2) : undefined}
        roughnessMap={assets.roughness ? roughnessMap : null}
        roughness={roughnessValue}
        metalness={metalnessValue}
      />
    </mesh>
  );
};
