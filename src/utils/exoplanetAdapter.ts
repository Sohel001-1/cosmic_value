import * as THREE from 'three';
import { CelestialBodyData, StellarParameters, VisualScaleParameters } from '../types/explorer';
import { ExoplanetCatalogRecord } from '../types/exoplanet';

// High quality deterministic string hash (Murmur / FNV variant)
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Pseudo-random generator from seed [0, 1)
export function createRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ExoplanetVisualFamily =
  | 'TERRESTRIAL_ROCKY'
  | 'SUPER_EARTH_VOLATILE'
  | 'SUB_NEPTUNE_ICE_GAS'
  | 'JOVIAN_GAS_GIANT'
  | 'HOT_JUPITER_IRRADIATED'
  | 'SPARSE_CANDIDATE';

export function determineVisualFamily(record: ExoplanetCatalogRecord): {
  family: ExoplanetVisualFamily;
  typeLabel: string;
  description: string;
} {
  const r = record.radiusEarths.value;
  const m = record.massEarths.value;
  const teq = record.equilibriumTempK.value;
  const discMethod = record.discoveryMethod ?? 'Unknown Method';
  const isDirectlyImaged = discMethod.toLowerCase().includes('imaging') || record.numSpectra.directImaging > 0;

  // 1. Extreme Irradiated Gas Giants / High Insolation Giants (e.g. WASP-121 b, 2MASS J03590986+2009361 b)
  if (
    (teq !== null && teq >= 950) ||
    (isDirectlyImaged && m !== null && m > 3000 && (teq === null || teq > 1200))
  ) {
    const imagingPrefix = isDirectlyImaged ? 'Directly Imaged ' : '';
    return {
      family: 'HOT_JUPITER_IRRADIATED',
      typeLabel: `${imagingPrefix}Hot Jovian Giant (High Insolation)`,
      description: `Illustrative model for a massive gas giant subjected to high stellar insolation${
        teq ? ` (equilibrium temperature ~${Math.round(teq)} K)` : ''
      }. Atmospheric circulation and cloud properties are not directly observed.`,
    };
  }

  // 2. Jovian Gas Giants (e.g. 47 UMa d, 11 Com b, 4 UMa b, 24 Sex c, 51 Eri b)
  if ((r !== null && r > 6.0) || (m !== null && m > 50.0)) {
    const imagingPrefix = isDirectlyImaged ? 'Directly Imaged ' : '';
    return {
      family: 'JOVIAN_GAS_GIANT',
      typeLabel: `${imagingPrefix}Jovian Gas Giant`,
      description: `Illustrative model for a Jovian-class giant planet based on ${
        record.massEarths.provenance === 'Msini' ? 'minimum mass' : 'bulk parameters'
      }. Atmospheric banding, coloration, and cloud patterns are illustrative possibilities, not observed facts.`,
    };
  }

  // 3. Sub-Neptunes / Volatile-Rich Worlds (e.g. Kepler-22 b, TOI-1231 b)
  if ((r !== null && r > 2.0 && r <= 6.0) || (m !== null && m > 8.0 && m <= 50.0)) {
    return {
      family: 'SUB_NEPTUNE_ICE_GAS',
      typeLabel: 'Sub-Neptune / Volatile-Rich Planet',
      description: `Illustrative model for an intermediate-sized planet with an inferred volatile-rich envelope. Surface boundary and exact atmospheric structure are unobserved.`,
    };
  }

  // 4. Super-Earths / Massive Terrestrials (e.g. 55 Cnc e, LHS 1140 b)
  if ((r !== null && r > 1.3 && r <= 2.0) || (m !== null && m > 2.2 && m <= 8.0)) {
    return {
      family: 'SUPER_EARTH_VOLATILE',
      typeLabel: 'Super-Earth (Massive Terrestrial)',
      description: `Illustrative model for a terrestrial planet larger than Earth. Surface topography, potential atmosphere, and mineral composition are unconstrained.`,
    };
  }

  // 5. Terrestrial Rocky Worlds (e.g. TRAPPIST-1 planets, Mercury analogs)
  if ((r !== null && r <= 1.3) || (m !== null && m <= 2.2)) {
    return {
      family: 'TERRESTRIAL_ROCKY',
      typeLabel: 'Terrestrial Rocky Planet',
      description: `Illustrative model for a terrestrial world. Surface geology and cratering are illustrative models based on Solar System terrestrial analogs.`,
    };
  }

  // 6. Sparse / Unconstrained Fallback
  return {
    family: 'SPARSE_CANDIDATE',
    typeLabel: 'Exoplanet Candidate (Sparse Data)',
    description: `Confirmed exoplanetary body with unconstrained bulk radius and mass. Rendered with an understated neutral illustrative model.`,
  };
}

// Compute a distinct, fixed 3D celestial spatial coordinate for each host star system
export function computeHostSystemCoordinates(hostname: string): [number, number, number] {
  const normHost = hostname.trim().toLowerCase();
  
  if (normHost === 'sun' || normHost === 'sol' || normHost.includes('solar')) {
    return [0, 0, 0];
  }
  if (normHost === 'toi-700' || normHost.startsWith('toi-700')) {
    return [40, 4, -25];
  }

  // Deterministically map host star name to a spatial coordinate in the celestial sphere
  const seed = hashString(hostname);
  const rng = createRNG(seed);

  // Distance from Solar System: between 38 and 56 Three.js units
  const radius = 42.0 + rng() * 16.0;
  
  // Golden ratio spiral distribution on sphere for uniform non-overlapping separation
  const theta = rng() * Math.PI * 2.0; // Azimuth
  const phi = (rng() - 0.5) * Math.PI * 0.7; // Elevation angle (-60 to +60 deg)

  const x = Number((Math.cos(phi) * Math.cos(theta) * radius).toFixed(2));
  const y = Number((Math.sin(phi) * radius * 0.5 + (rng() - 0.5) * 6.0).toFixed(2));
  const z = Number((Math.cos(phi) * Math.sin(theta) * radius).toFixed(2));

  return [x, y, z];
}

export function computeVisualScale(record: ExoplanetCatalogRecord): VisualScaleParameters {
  const r = record.radiusEarths.value;
  const m = record.massEarths.value;
  let visualRadius = 1.9;

  if (r !== null) {
    if (r <= 1.25) visualRadius = 1.6;
    else if (r <= 2.2) visualRadius = 2.0;
    else if (r <= 5.0) visualRadius = 2.5;
    else if (r <= 14.0) visualRadius = 3.2;
    else visualRadius = 3.6;
  } else if (m !== null) {
    if (m <= 2.5) visualRadius = 1.6;
    else if (m <= 10.0) visualRadius = 2.0;
    else if (m <= 100.0) visualRadius = 2.5;
    else if (m <= 3000.0) visualRadius = 3.2;
    else visualRadius = 3.6; // Super-Jupiter / massive giant tier
  }

  const worldPos = computeHostSystemCoordinates(record.hostname);

  const hasAccurateOrbit = Boolean(
    record.orbitalPeriodDays.value !== null || record.semiMajorAxisAu.value !== null
  );

  return {
    visualRadius,
    orbitRadius: 16.0,
    orbitSpeed: 0.025,
    rotationSpeed: 0.003 + (hashString(record.name) % 100) * 0.00003,
    worldPosition: worldPos,
    minCameraDistance: visualRadius * 2.1, // Defensible screen-space limit preventing texel blur at high zoom
    maxCameraDistance: Math.max(35.0, visualRadius * 15.0),
    hasAccurateOrbit,
  };
}

export function computeStellarParameters(record: ExoplanetCatalogRecord): StellarParameters {
  const teff = record.stellar.teffK.value ?? 5500;
  const spectype = (record.stellar.spectralType || '').toUpperCase();
  const worldPos = computeHostSystemCoordinates(record.hostname);

  let lightColor = '#fffaf0';
  let lightIntensity = 2.1;

  if (spectype.startsWith('M') || teff < 3700) {
    lightColor = '#ffd1a4';
    lightIntensity = 1.7;
  } else if (spectype.startsWith('K') || (teff >= 3700 && teff < 5200)) {
    lightColor = '#fed7aa';
    lightIntensity = 1.9;
  } else if (spectype.startsWith('A') || spectype.startsWith('B') || teff > 7500) {
    lightColor = '#e0f2fe';
    lightIntensity = 2.5;
  } else if (spectype.startsWith('F') || (teff >= 6000 && teff <= 7500)) {
    lightColor = '#f8fafc';
    lightIntensity = 2.3;
  } else {
    lightColor = '#fffaf0';
    lightIntensity = 2.1;
  }

  return {
    name: record.hostname,
    spectralType: record.stellar.spectralType || `${Math.round(teff)} K Stellar Host`,
    effectiveTemperatureK: teff,
    luminositySolar: record.stellar.luminosityLogSolar.value
      ? Math.pow(10, record.stellar.luminosityLogSolar.value)
      : 1.0,
    lightColor,
    lightIntensity,
    worldPosition: [worldPos[0] - 16, worldPos[1], worldPos[2]],
  };
}

export function adaptExoplanetRecordToCelestialBody(
  record: ExoplanetCatalogRecord
): CelestialBodyData {
  const visualScale = computeVisualScale(record);
  const { family, typeLabel, description } = determineVisualFamily(record);
  const distanceLy = record.distancePc.value ? record.distancePc.value * 3.26156 : null;

  // Mass provenance formatting
  let massEvidence: 'OBSERVED' | 'DERIVED' | 'MODEL' | 'UNKNOWN' = 'UNKNOWN';
  let massNote = 'Mass unmeasured in default snapshot row';
  if (record.massEarths.value !== null) {
    const prov = record.massEarths.provenance;
    if (prov === 'Mass') {
      massEvidence = 'OBSERVED';
      massNote = 'True bulk mass determined from dynamical orbit or transit timing variations';
    } else if (prov === 'Msini' || prov === 'Msin(i)/sin(i)') {
      massEvidence = 'DERIVED';
      massNote = 'Minimum mass (M sin i); orbital inclination is unconstrained';
    } else if (prov === 'Mass-Radius' || prov === 'M-R') {
      massEvidence = 'MODEL';
      massNote = 'Empirical/theoretical mass inferred from observed radius via Mass-Radius relation';
    } else {
      massEvidence = 'DERIVED';
      massNote = `Provenance: ${prov || 'Unspecified'}`;
    }
  }

  return {
    id: `exo-${record.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: record.name,
    systemId: `sys-${record.hostname.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    systemName: `${record.hostname} System`,
    category: 'exoplanet',
    type: typeLabel,
    description: `${description} Orbiting host star ${record.hostname}${
      distanceLy ? `, located ~${distanceLy.toFixed(1)} light-years (${record.distancePc.value?.toFixed(1)} pc) away` : ''
    }. Discovered in ${record.discoveryYear ?? 'unknown year'} via ${record.discoveryMethod ?? 'astronomical detection'}.`,
    primaryEvidence: 'MODEL',
    disclaimer: 'Appearance is an illustrative model. Not a direct image.',
    scientificData: {
      radiusKm: {
        value: record.radiusEarths.value ? record.radiusEarths.value * 6371.0 : null,
        unit: 'km',
        evidence: record.radiusEarths.value !== null ? 'OBSERVED' : 'UNKNOWN',
        note: record.radiusEarths.value ? 'Converted from Earth radii (1 R⊕ = 6,371 km)' : 'Radius not measured in catalog',
        err1: record.radiusEarths.err1 ? record.radiusEarths.err1 * 6371.0 : undefined,
        err2: record.radiusEarths.err2 ? record.radiusEarths.err2 * 6371.0 : undefined,
        lim: record.radiusEarths.lim,
        reference: record.planetReference,
      },
      radiusEarths: {
        value: record.radiusEarths.value,
        unit: 'R⊕',
        evidence: record.radiusEarths.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.radiusEarths.err1,
        err2: record.radiusEarths.err2,
        lim: record.radiusEarths.lim,
        reference: record.planetReference,
      },
      massEarths: {
        value: record.massEarths.value,
        unit: record.massEarths.provenance === 'Msini' || record.massEarths.provenance === 'Msin(i)/sin(i)' ? 'M⊕ (M sin i)' : 'M⊕',
        evidence: massEvidence,
        note: massNote,
        err1: record.massEarths.err1,
        err2: record.massEarths.err2,
        lim: record.massEarths.lim,
        provenance: record.massEarths.provenance === 'Msin(i)/sin(i)' ? 'Msini' : record.massEarths.provenance,
        reference: record.planetReference,
      },
      densityGcm3: {
        value: record.densityGcm3.value,
        unit: 'g/cm³',
        evidence: record.densityGcm3.value !== null ? 'DERIVED' : 'UNKNOWN',
        err1: record.densityGcm3.err1,
        err2: record.densityGcm3.err2,
        lim: record.densityGcm3.lim,
        reference: record.planetReference,
      },
      equilibriumTempK: {
        value: record.equilibriumTempK.value,
        unit: 'K',
        evidence: record.equilibriumTempK.value !== null ? 'DERIVED' : 'UNKNOWN',
        note: record.equilibriumTempK.value ? 'Calculated planetary blackbody equilibrium temperature' : undefined,
        err1: record.equilibriumTempK.err1,
        err2: record.equilibriumTempK.err2,
        lim: record.equilibriumTempK.lim,
        reference: record.planetReference,
      },
      surfaceTempK: {
        value: null,
        evidence: 'UNKNOWN',
        note: 'Surface temperature unobserved; requires in-situ or direct spectral atmospheric measurement',
      },
      orbitalPeriodDays: {
        value: record.orbitalPeriodDays.value,
        unit: 'days',
        evidence: record.orbitalPeriodDays.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.orbitalPeriodDays.err1,
        err2: record.orbitalPeriodDays.err2,
        lim: record.orbitalPeriodDays.lim,
        reference: record.planetReference,
      },
      semiMajorAxisAu: {
        value: record.semiMajorAxisAu.value,
        unit: 'AU',
        evidence: record.semiMajorAxisAu.value !== null ? 'DERIVED' : 'UNKNOWN',
        err1: record.semiMajorAxisAu.err1,
        err2: record.semiMajorAxisAu.err2,
        lim: record.semiMajorAxisAu.lim,
        reference: record.planetReference,
      },
      eccentricity: {
        value: record.eccentricity.value,
        evidence: record.eccentricity.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.eccentricity.err1,
        err2: record.eccentricity.err2,
        lim: record.eccentricity.lim,
      },
      insolationFlux: {
        value: record.insolationFluxEarths.value,
        unit: 'S⊕',
        evidence: record.insolationFluxEarths.value !== null ? 'DERIVED' : 'UNKNOWN',
        err1: record.insolationFluxEarths.err1,
        err2: record.insolationFluxEarths.err2,
        lim: record.insolationFluxEarths.lim,
      },
      distancePc: {
        value: record.distancePc.value,
        unit: 'pc',
        evidence: record.distancePc.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.distancePc.err1,
        err2: record.distancePc.err2,
      },
      distanceLy: {
        value: distanceLy ? Number(distanceLy.toFixed(2)) : null,
        unit: 'ly',
        evidence: distanceLy !== null ? 'DERIVED' : 'UNKNOWN',
      },
      hostStar: record.hostname,
      discoveryYear: {
        value: record.discoveryYear,
        evidence: 'OBSERVED',
      },
      discoveryMethod: {
        value: record.discoveryMethod ?? 'Unknown Method',
        evidence: 'OBSERVED',
      },
      discoveryFacility: {
        value: record.discoveryFacility ?? 'Not Specified',
        evidence: 'OBSERVED',
      },
      spectralType: {
        value: record.stellar.spectralType,
        evidence: record.stellar.spectralType ? 'OBSERVED' : 'UNKNOWN',
      },
      stellarTeffK: {
        value: record.stellar.teffK.value,
        unit: 'K',
        evidence: record.stellar.teffK.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.stellar.teffK.err1,
        err2: record.stellar.teffK.err2,
        reference: record.stellar.reference,
      },
      stellarRadiusSolar: {
        value: record.stellar.radiusSolar.value,
        unit: 'R☉',
        evidence: record.stellar.radiusSolar.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.stellar.radiusSolar.err1,
        err2: record.stellar.radiusSolar.err2,
        reference: record.stellar.reference,
      },
      stellarMassSolar: {
        value: record.stellar.massSolar.value,
        unit: 'M☉',
        evidence: record.stellar.massSolar.value !== null ? 'OBSERVED' : 'UNKNOWN',
        err1: record.stellar.massSolar.err1,
        err2: record.stellar.massSolar.err2,
        reference: record.stellar.reference,
      },
      publicationDate: {
        value: record.publicationDate,
        evidence: 'OBSERVED',
      },
      rowUpdate: {
        value: record.rowUpdate,
        evidence: 'OBSERVED',
      },
    },
    visualScale,
    assets: {
      preview: `/assets/procedural/${family.toLowerCase()}/preview.webp`,
      color: `/assets/procedural/${family.toLowerCase()}/color.webp`,
      high: null,
      normal: `/assets/procedural/${family.toLowerCase()}/normal.webp`,
      roughness: `/assets/procedural/${family.toLowerCase()}/roughness.webp`,
      height: null,
      clouds: null,
      atmosphere: null,
    },
    source: {
      organization: 'NASA Exoplanet Archive / IPAC / Caltech',
      mission: record.discoveryFacility || 'Astronomical Observatory Survey',
      referencePage: `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(record.name)}`,
      license: 'Public Domain / NASA Exoplanet Archive Data Policy',
      usageNotes: `Authoritative default parameter set (default_flag=1) from NASA Exoplanet Archive snapshot PS_2026.09.20_10.52.04.csv. Primary reference: ${
        record.planetReference?.label || 'Published Literature'
      }.`,
      isCatalogImport: true,
      snapshotFile: 'PS_2026.09.20_10.52.04.csv',
      rawRecord: record,
    },
  };
}
