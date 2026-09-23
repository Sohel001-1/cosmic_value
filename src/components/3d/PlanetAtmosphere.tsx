import React, { useMemo } from 'react';
import * as THREE from 'three';

interface PlanetAtmosphereProps {
  radius: number;
  glowColor?: string;
  intensity?: number;
}

export const PlanetAtmosphere: React.FC<PlanetAtmosphereProps> = ({
  radius,
  glowColor = '#93c5fd',
  intensity = 0.22,
}) => {
  const customMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(-vPosition);
          float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
          float alpha = pow(fresnel, 3.5) * uIntensity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(glowColor) },
        uIntensity: { value: intensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [glowColor, intensity]);

  return (
    <mesh scale={[1.035, 1.035, 1.035]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <primitive object={customMaterial} attach="material" />
    </mesh>
  );
};
