import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  center?: [number, number, number];
  targetPosition?: [number, number, number];
  targetRadius?: number;
}

export const OrbitPath: React.FC<OrbitPathProps> = ({
  radius,
  color = '#38bdf8',
  opacity = 0.22,
  center = [0, 0, 0],
  targetRadius = 1.6,
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  // Generate an open C-shaped arc that terminates cleanly on either side of the planet with zero bridging chords.
  // Guard against non-positive or non-finite radius inside useMemo without early hook return.
  const points = useMemo(() => {
    if (!radius || radius <= 0 || !Number.isFinite(radius)) {
      return [];
    }

    const pts: THREE.Vector3[] = [];
    const segments = 192;
    const safeMargin = Math.min(targetRadius * 1.35, radius * 0.9);
    const ratio = Math.min(1.0, Math.max(-1.0, safeMargin / Math.max(0.0001, radius)));
    const deltaAngle = Math.asin(ratio);

    const startTheta = deltaAngle;
    const endTheta = Math.PI * 2 - deltaAngle;

    for (let i = 0; i <= segments; i++) {
      const theta = startTheta + (i / segments) * (endTheta - startTheta);
      pts.push(
        new THREE.Vector3(
          center[0] + Math.cos(theta) * radius,
          center[1],
          center[2] + Math.sin(theta) * radius
        )
      );
    }
    return pts;
  }, [radius, center, targetRadius]);

  const lineGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    if (points.length > 0) {
      geom.setFromPoints(points);
    }
    return geom;
  }, [points]);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      depthTest: true,
      depthWrite: false,
    });
  }, [color, opacity]);

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      material.dispose();
    };
  }, [lineGeometry, material]);

  // Fade out orbit guide during close planetary inspection
  useFrame(({ camera }) => {
    if (!materialRef.current || !lineRef.current) return;

    if (!radius || radius <= 0 || !Number.isFinite(radius) || points.length === 0) {
      materialRef.current.visible = false;
      return;
    }

    lineRef.current.getWorldPosition(worldPos);
    const dist = camera.position.distanceTo(worldPos);
    const fadeDist = targetRadius * 6.0;
    const minDist = targetRadius * 2.2;

    if (dist < fadeDist) {
      const denominator = Math.max(0.0001, fadeDist - minDist);
      const factor = Math.max(0.0, Math.min(1.0, (dist - minDist) / denominator));
      materialRef.current.opacity = opacity * factor;
      materialRef.current.visible = factor > 0.01;
    } else {
      materialRef.current.opacity = opacity;
      materialRef.current.visible = true;
    }
  });

  if (!radius || radius <= 0 || !Number.isFinite(radius) || points.length === 0) {
    return null;
  }

  return (
    <primitive
      ref={lineRef}
      object={new THREE.Line(lineGeometry, material)}
      renderOrder={-1}
    >
      <primitive ref={materialRef} object={material} attach="material" />
    </primitive>
  );
};

