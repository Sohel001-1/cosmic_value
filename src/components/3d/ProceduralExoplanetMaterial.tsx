import React, { useMemo } from 'react';
import * as THREE from 'three';
import { hashString, createRNG, ExoplanetVisualFamily } from '../../utils/exoplanetAdapter';
import { CelestialBodyData } from '../../types/explorer';

interface ProceduralExoplanetProps {
  body: CelestialBodyData;
  radius: number;
  rotationSpeed?: number;
}

// Bounded texture cache to prevent redundant canvas operations
const canvasTextureCache = new Map<string, THREE.CanvasTexture>();

// Fast 2D simplex-style gradient noise for multi-scale atmospheric and geological flow
function createNoise2D(rng: () => number) {
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(rng() * (i + 1));
    const tmp = p[i];
    p[i] = p[r];
    p[r] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const grad2 = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ];

  function dot2(g: number[], x: number, y: number) {
    return g[0] * x + g[1] * y;
  }

  return function noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    // Quintic polynomial fade curve: 6t^5 - 15t^4 + 10t^3
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10);
    const v = yf * yf * yf * (yf * (yf * 6 - 15) + 10);

    const g00 = grad2[perm[X + perm[Y]] % 8];
    const g10 = grad2[perm[X + 1 + perm[Y]] % 8];
    const g01 = grad2[perm[X + perm[Y + 1]] % 8];
    const g11 = grad2[perm[X + 1 + perm[Y + 1]] % 8];

    const n00 = dot2(g00, xf, yf);
    const n10 = dot2(g10, xf - 1, yf);
    const n01 = dot2(g01, xf, yf - 1);
    const n11 = dot2(g11, xf - 1, yf - 1);

    const nx0 = n00 + u * (n10 - n00);
    const nx1 = n01 + u * (n11 - n01);
    return nx0 + v * (nx1 - nx0);
  };
}

// Multi-octave Fractional Brownian Motion with domain warping
function fbm(noise: (x: number, y: number) => number, x: number, y: number, octaves: number = 4): number {
  let val = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise(x * freq, y * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return val;
}

// Color interpolation helpers
interface RGB { r: number; g: number; b: number }
function lerpRGB(c1: RGB, c2: RGB, t: number): RGB {
  const clampT = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + clampT * (c2.r - c1.r)),
    g: Math.round(c1.g + clampT * (c2.g - c1.g)),
    b: Math.round(c1.b + clampT * (c2.b - c1.b)),
  };
}

function hexToRGB(hex: string): RGB {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function evaluatePalette(palette: RGB[], signal: number): RGB {
  const clamped = Math.max(0, Math.min(1, signal));
  const pos = clamped * (palette.length - 1);
  const idx1 = Math.floor(pos);
  const idx2 = Math.min(palette.length - 1, idx1 + 1);
  const frac = pos - idx1;
  return lerpRGB(palette[idx1], palette[idx2], frac);
}

// Family-specific texture generation implementations
function generateHighQualityAtmosphericTexture(body: CelestialBodyData): THREE.CanvasTexture {
  const cacheKey = `${body.id}_${body.name}`;
  if (canvasTextureCache.has(cacheKey)) {
    return canvasTextureCache.get(cacheKey)!;
  }

  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;

  const seed = hashString(body.name);
  const rng = createRNG(seed);
  const noise = createNoise2D(rng);

  const rawRecord = body.source.rawRecord;
  const teq = rawRecord?.equilibriumTempK.value ?? null;
  const mass = rawRecord?.massEarths.value ?? null;
  const radiusVal = rawRecord?.radiusEarths.value ?? null;
  const discMethod = rawRecord?.discoveryMethod ?? '';
  const isDirectlyImaged = discMethod.toLowerCase().includes('imaging') || (rawRecord?.numSpectra.directImaging ?? 0) > 0;

  // Determine family
  let family: ExoplanetVisualFamily = 'SPARSE_CANDIDATE';
  if (
    (teq !== null && teq >= 950) ||
    (isDirectlyImaged && mass !== null && mass > 3000 && (teq === null || teq > 1200))
  ) {
    family = 'HOT_JUPITER_IRRADIATED';
  } else if ((radiusVal !== null && radiusVal > 6.0) || (mass !== null && mass > 50.0)) {
    family = 'JOVIAN_GAS_GIANT';
  } else if ((radiusVal !== null && radiusVal > 2.0) || (mass !== null && mass > 8.0)) {
    family = 'SUB_NEPTUNE_ICE_GAS';
  } else if ((radiusVal !== null && radiusVal > 1.3) || (mass !== null && mass > 2.2)) {
    family = 'SUPER_EARTH_VOLATILE';
  } else if ((radiusVal !== null && radiusVal <= 1.3) || (mass !== null && mass <= 2.2)) {
    family = 'TERRESTRIAL_ROCKY';
  }

  // Pre-seed craters for terrestrial rocky worlds
  const craters: { x: number; y: number; r: number; depth: number }[] = [];
  if (family === 'TERRESTRIAL_ROCKY') {
    const numCraters = 28 + Math.floor(rng() * 20);
    for (let i = 0; i < numCraters; i++) {
      craters.push({
        x: rng(),
        y: 0.1 + rng() * 0.8,
        r: 0.015 + rng() * 0.06,
        depth: 0.3 + rng() * 0.7,
      });
    }
  }

  // Palette setups
  let palette: RGB[] = [];
  if (family === 'HOT_JUPITER_IRRADIATED') {
    palette = [
      hexToRGB('171514'), // Alkali soot absorption
      hexToRGB('26201c'), // Dark graphite
      hexToRGB('3d2316'), // Muted iron-silicate brown
      hexToRGB('4d2f1f'), // Sub-stellar thermal streak
      hexToRGB('201814'), // Thermal shadow
    ];
  } else if (family === 'JOVIAN_GAS_GIANT') {
    const jovianOptions = [
      [hexToRGB('dfd7ca'), hexToRGB('c4b19b'), hexToRGB('9a8268'), hexToRGB('745d47'), hexToRGB('584838')], // Classic Jupiter
      [hexToRGB('ede7dd'), hexToRGB('dcd2c3'), hexToRGB('b4a38d'), hexToRGB('8e7a64'), hexToRGB('685848')], // Saturn pale gold
      [hexToRGB('d6dadf'), hexToRGB('a3abb5'), hexToRGB('737c89'), hexToRGB('4d5663'), hexToRGB('363e4a')], // Cool water-ice Jovian
      [hexToRGB('e5dacb'), hexToRGB('c9b7a1'), hexToRGB('a68c74'), hexToRGB('806751'), hexToRGB('5d493a')], // Warm giant
    ];
    palette = jovianOptions[Math.floor(rng() * jovianOptions.length)];
  } else if (family === 'SUB_NEPTUNE_ICE_GAS') {
    const subNeptuneOptions = [
      [hexToRGB('164e63'), hexToRGB('0e7490'), hexToRGB('0891b2'), hexToRGB('38bdf8'), hexToRGB('0f394c')], // Slate cyan
      [hexToRGB('1e3a5f'), hexToRGB('2b537d'), hexToRGB('43789f'), hexToRGB('78abc7'), hexToRGB('142740')], // Azure marine
      [hexToRGB('134e4a'), hexToRGB('115e59'), hexToRGB('0d9488'), hexToRGB('5eead4'), hexToRGB('0c3835')], // Deep teal haze
    ];
    palette = subNeptuneOptions[Math.floor(rng() * subNeptuneOptions.length)];
  } else if (family === 'SUPER_EARTH_VOLATILE') {
    palette = [
      hexToRGB('182230'), // Deep basalt lowland
      hexToRGB('2a374a'), // Silicate crust
      hexToRGB('475569'), // Highland plateau
      hexToRGB('94a3b8'), // Lower atmospheric haze
      hexToRGB('dbeafe'), // Upper volatile cloud veil
    ];
  } else if (family === 'TERRESTRIAL_ROCKY') {
    const rockyOptions = [
      [hexToRGB('1c1917'), hexToRGB('292524'), hexToRGB('44403c'), hexToRGB('78716c'), hexToRGB('a8a29e')], // Lunar basalt & feldspar
      [hexToRGB('261914'), hexToRGB('3f261d'), hexToRGB('5c3d2e'), hexToRGB('855b45'), hexToRGB('b08265')], // Ferric oxide / Mercury analog
      [hexToRGB('1e293b'), hexToRGB('334155'), hexToRGB('475569'), hexToRGB('64748b'), hexToRGB('94a3b8')], // Slate silicate
    ];
    palette = rockyOptions[Math.floor(rng() * rockyOptions.length)];
  } else {
    // SPARSE_CANDIDATE
    palette = [
      hexToRGB('273244'),
      hexToRGB('374458'),
      hexToRGB('4e5d74'),
      hexToRGB('6e7f98'),
      hexToRGB('212a39'),
    ];
  }

  // Vortex setup for Jovians
  const hasVortex = (family === 'JOVIAN_GAS_GIANT') && rng() > 0.35;
  const vortexU = 0.2 + rng() * 0.6;
  const vortexV = 0.35 + rng() * 0.3;
  const vortexRadius = 0.07 + rng() * 0.05;
  const vortexStrength = 0.12 + rng() * 0.12;

  // Gas band frequencies
  const bandFrequency = family === 'JOVIAN_GAS_GIANT' ? 10.0 + rng() * 8.0 : 4.0 + rng() * 3.0;
  const shearStrength = family === 'JOVIAN_GAS_GIANT' ? 0.35 : 0.15;

  for (let y = 0; y < height; y++) {
    const v = y / height; // 0 (North Pole) to 1 (South Pole)
    const lat = (v - 0.5) * Math.PI; // -pi/2 to pi/2

    for (let x = 0; x < width; x++) {
      const u = x / width; // 0 to 1

      let signal = 0.5;

      if (family === 'JOVIAN_GAS_GIANT') {
        let sampleU = u * 4.0;
        let sampleV = v;

        // Flow-deforming vortex
        if (hasVortex) {
          let du = (u - vortexU);
          if (du > 0.5) du -= 1.0;
          if (du < -0.5) du += 1.0;
          const dv = (v - vortexV) * 2.0;
          const distSq = du * du + dv * dv;
          if (distSq < vortexRadius * vortexRadius) {
            const factor = Math.exp(-distSq / (vortexRadius * vortexRadius * 0.5));
            const angle = Math.atan2(dv, du) + Math.PI * 0.5;
            sampleU += Math.cos(angle) * factor * vortexStrength;
            sampleV += Math.sin(angle) * factor * (vortexStrength * 0.25);
          }
        }

        const warp1 = noise(sampleU * 2.0, sampleV * bandFrequency);
        const warp2 = noise(sampleU * 4.0 + warp1 * shearStrength, sampleV * (bandFrequency * 1.6));
        const turbulence = fbm(noise, sampleU * 3.0 + warp2 * 0.3, sampleV * bandFrequency + warp1 * 0.25, 4);

        let bandSignal = Math.sin(sampleV * Math.PI * bandFrequency + warp1 * 1.4);
        bandSignal = (bandSignal + 1.0) * 0.5;
        signal = bandSignal * 0.65 + (turbulence + 0.5) * 0.35;

      } else if (family === 'HOT_JUPITER_IRRADIATED') {
        // High insolation / eastward equatorial jet stream with chevron shear
        const jetWarp = Math.sin((u - 0.5) * Math.PI) * Math.cos(lat) * 0.6;
        const shear = noise((u * 3.0 + jetWarp) * 2.0, (v - 0.5) * 6.0);
        const turb = fbm(noise, u * 4.0 + shear * 0.3, v * 3.0, 3);
        const dayNightContrast = Math.cos((u - 0.5) * Math.PI) * 0.25;
        signal = 0.4 + turb * 0.35 + dayNightContrast;

      } else if (family === 'SUB_NEPTUNE_ICE_GAS') {
        // Thick hazy envelope with broad subtle latitudinal gradient & faint wispy cirrus
        const broadZone = Math.sin(v * Math.PI * 3.0) * 0.15;
        const haze = fbm(noise, u * 5.0, v * 3.0, 3) * 0.2;
        signal = 0.5 + broadZone + haze;

      } else if (family === 'SUPER_EARTH_VOLATILE') {
        // Swirling cloud decks over fractured lithosphere
        const terrain = fbm(noise, u * 4.0, v * 3.0, 4);
        const clouds = fbm(noise, u * 6.0 + terrain * 0.3, v * 5.0, 4);
        signal = (terrain * 0.45) + (clouds * 0.55);

      } else if (family === 'TERRESTRIAL_ROCKY') {
        // Multi-scale rocky terrain + impact craters
        const terrain = fbm(noise, u * 6.0, v * 4.0, 5);
        let craterVal = 0;
        for (const cr of craters) {
          let du = Math.abs(u - cr.x);
          if (du > 0.5) du = 1.0 - du;
          const dv = Math.abs(v - cr.y) * 1.5;
          const dist = Math.sqrt(du * du + dv * dv);
          if (dist < cr.r * 1.5) {
            const normDist = dist / cr.r;
            if (normDist < 1.0) {
              // Deep bowl floor
              craterVal -= (1.0 - normDist * normDist) * cr.depth * 0.4;
            } else {
              // Raised rim and ejecta
              const rimDist = normDist - 1.0;
              craterVal += Math.exp(-rimDist * rimDist * 16.0) * cr.depth * 0.3;
            }
          }
        }
        signal = 0.5 + (terrain - 0.5) * 0.6 + craterVal;

      } else {
        // SPARSE_CANDIDATE: honest, understated planetary gradation
        const macro = fbm(noise, u * 2.0, v * 2.0, 2) * 0.25;
        const micro = (noise(u * 12.0, v * 12.0)) * 0.08;
        signal = 0.5 + macro + micro;
      }

      const rgb = evaluatePalette(palette, signal);

      // Polar atmospheric/photometric limb attenuation
      const polarDim = Math.cos(lat * 0.95);
      const minDim = family === 'TERRESTRIAL_ROCKY' ? 0.75 : 0.65;
      const dimFactor = Math.max(minDim, polarDim);

      const pIdx = (y * width + x) * 4;
      data[pIdx] = Math.round(rgb.r * dimFactor);
      data[pIdx + 1] = Math.round(rgb.g * dimFactor);
      data[pIdx + 2] = Math.round(rgb.b * dimFactor);
      data[pIdx + 3] = 255;
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

  // Manage cache capacity
  if (canvasTextureCache.size > 35) {
    const firstKey = canvasTextureCache.keys().next().value;
    if (firstKey) {
      canvasTextureCache.get(firstKey)?.dispose();
      canvasTextureCache.delete(firstKey);
    }
  }
  canvasTextureCache.set(cacheKey, texture);

  return texture;
}

export const ProceduralExoplanetMesh: React.FC<ProceduralExoplanetProps> = ({
  body,
  radius,
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const texture = useMemo(() => generateHighQualityAtmosphericTexture(body), [body]);

  // Authentic atmospheric PBR scattering response (zero plastic specular sheen)
  const { roughness, metalness } = useMemo(() => {
    const rawRecord = body.source.rawRecord;
    const teq = rawRecord?.equilibriumTempK.value ?? null;
    const mass = rawRecord?.massEarths.value ?? null;
    const radiusVal = rawRecord?.radiusEarths.value ?? null;

    if (teq !== null && teq >= 950) {
      return { roughness: 0.88, metalness: 0.0 };
    }
    if ((radiusVal !== null && radiusVal > 6.0) || (mass !== null && mass > 50.0)) {
      return { roughness: 0.90, metalness: 0.0 };
    }
    if ((radiusVal !== null && radiusVal > 2.0) || (mass !== null && mass > 8.0)) {
      return { roughness: 0.92, metalness: 0.0 };
    }
    if ((radiusVal !== null && radiusVal > 1.3) || (mass !== null && mass > 2.2)) {
      return { roughness: 0.94, metalness: 0.0 };
    }
    return { roughness: 0.96, metalness: 0.0 };
  }, [body]);

  return (
    <mesh ref={meshRef} castShadow={false} receiveShadow={false}>
      {/* High geometric fidelity sphere */}
      <sphereGeometry args={[radius, 128, 128]} />
      <meshStandardMaterial
        map={texture}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
};
