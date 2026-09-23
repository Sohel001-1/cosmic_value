import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OrbitControls } from '@react-three/drei';
import { useExplorerStore } from '../../store/useExplorerStore';

export const CameraController: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const selectedBody = useExplorerStore((state) => state.selectedBody);
  const isTransitioning = useExplorerStore((state) => state.isTransitioning);
  const setTransitioning = useExplorerStore((state) => state.setTransitioning);
  const setRenderedFrameId = useExplorerStore((state) => state.setRenderedFrameId);
  const clearDepartingBody = useExplorerStore((state) => state.clearDepartingBody);

  const isOverview = selectedBody.id === 'solar-system-overview';
  const minDistance = selectedBody.visualScale.minCameraDistance;
  const maxDistance = selectedBody.visualScale.maxCameraDistance;

  const targetRadius = selectedBody.visualScale.visualRadius;
  const targetVec = useRef(new THREE.Vector3(...selectedBody.visualScale.worldPosition));
  const destinationCamPos = useRef(new THREE.Vector3());

  // Transition flight path tracker
  const flightProgress = useRef(0);
  const startCamPos = useRef(new THREE.Vector3());
  const startTargetPos = useRef(new THREE.Vector3());
  const needsSunAvoidanceArc = useRef(false);

  useEffect(() => {
    targetVec.current.set(...selectedBody.visualScale.worldPosition);

    if (isOverview) {
      // Solar System Overview framing (elevated 34 deg angle over the ecliptic plane)
      destinationCamPos.current.set(0, 48, 72);
      targetVec.current.set(0, 0, 0);
    } else if (selectedBody.id === 'sun') {
      destinationCamPos.current.set(-targetRadius * 2.5, targetRadius * 1.2, targetRadius * 3.5);
    } else {
      const desiredOffset = new THREE.Vector3(
        -targetRadius * 2.0,
        targetRadius * 1.0,
        targetRadius * 3.0
      );
      destinationCamPos.current.copy(targetVec.current).add(desiredOffset);
    }

    if (controlsRef.current) {
      startCamPos.current.copy(camera.position);
      startTargetPos.current.copy(controlsRef.current.target);
      flightProgress.current = 0;

      // Check if straight-line flight chord intersects close to the Sun at [0, 0, 0]
      const midpoint = new THREE.Vector3().addVectors(startCamPos.current, destinationCamPos.current).multiplyScalar(0.5);
      const distToSun = midpoint.distanceTo(new THREE.Vector3(0, 0, 0));
      needsSunAvoidanceArc.current = distToSun < 10.0 && !isOverview && selectedBody.systemId === 'solar-system';
    }

    // Preload destination textures
    const loader = new THREE.TextureLoader();
    if (selectedBody.assets.preview) loader.load(selectedBody.assets.preview);
    if (selectedBody.assets.color) loader.load(selectedBody.assets.color);
    if (selectedBody.assets.high) loader.load(selectedBody.assets.high);
    if (selectedBody.assets.normal) loader.load(selectedBody.assets.normal);
    if (selectedBody.assets.roughness) loader.load(selectedBody.assets.roughness);
  }, [selectedBody, isOverview, targetRadius, camera]);

  // Smooth continuous transition loop with Sun collision avoidance
  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning) {
      const step = Math.min(1.0, delta * 3.2);

      // Smooth exponential focus tracking
      controlsRef.current.target.lerp(targetVec.current, step);

      // Smooth camera position interpolation
      camera.position.lerp(destinationCamPos.current, step);

      // Elevation arc boost if flight trajectory passes near Sun center
      if (needsSunAvoidanceArc.current) {
        const distToDestination = camera.position.distanceTo(destinationCamPos.current);
        const totalDist = startCamPos.current.distanceTo(destinationCamPos.current);
        if (totalDist > 0) {
          const t = 1.0 - Math.min(1.0, distToDestination / totalDist);
          const arcHeight = Math.sin(t * Math.PI) * 8.0;
          camera.position.y += arcHeight * delta * 2.0;
        }
      }

      controlsRef.current.update();

      const distToTarget = controlsRef.current.target.distanceTo(targetVec.current);
      const distToCam = camera.position.distanceTo(destinationCamPos.current);

      if (distToTarget < 0.05 && distToCam < 0.15) {
        setRenderedFrameId(selectedBody.systemId);
        clearDepartingBody();
        setTransitioning(false);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.8}
      minDistance={minDistance}
      maxDistance={maxDistance}
      enablePan={false}
      makeDefault
    />
  );
};
