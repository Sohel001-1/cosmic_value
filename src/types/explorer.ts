import { ExoplanetCatalogRecord } from './exoplanet';

export type EvidenceCategory = 'OBSERVED' | 'DERIVED' | 'MODEL' | 'UNKNOWN';

export interface ScientificField<T> {
  value: T | null;
  unit?: string;
  evidence: EvidenceCategory;
  note?: string;
  err1?: number | null;
  err2?: number | null;
  lim?: number | null;
  provenance?: string | null;
  reference?: { label: string; url: string | null } | null;
}

export interface DetailedScientificMeasurements {
  radiusKm: ScientificField<number>;
  radiusEarths?: ScientificField<number>;
  massEarths: ScientificField<number>;
  densityGcm3: ScientificField<number>;
  equilibriumTempK: ScientificField<number>;
  surfaceTempK: ScientificField<number>;
  orbitalPeriodDays: ScientificField<number>;
  semiMajorAxisAu: ScientificField<number>;
  eccentricity?: ScientificField<number>;
  insolationFlux?: ScientificField<number>;
  distancePc?: ScientificField<number>;
  distanceLy?: ScientificField<number>;
  hostStar: string;
  discoveryYear: ScientificField<number>;
  discoveryMethod: ScientificField<string>;
  discoveryFacility?: ScientificField<string>;
  spectralType?: ScientificField<string>;
  stellarTeffK?: ScientificField<number>;
  stellarRadiusSolar?: ScientificField<number>;
  stellarMassSolar?: ScientificField<number>;
  publicationDate?: ScientificField<string>;
  rowUpdate?: ScientificField<string>;
}

export type ReferenceFrameId = string; // 'solar-system' | 'toi-700' | `dynamic-${hostname}`

export interface VisualScaleParameters {
  visualRadius: number; // Three.js viewport units
  orbitRadius: number;  // Distance from host star in active reference frame
  orbitSpeed: number;   // Orbit speed multiplier
  rotationSpeed: number;// Axial spin multiplier
  worldPosition: [number, number, number]; // World space position for smooth camera interpolation
  minCameraDistance: number; // Texture-safe minimum distance
  maxCameraDistance: number;
  hasAccurateOrbit: boolean; // Flag if semi-major axis & period are physical
}

export interface AssetMapCollection {
  preview: string;
  color: string;
  high?: string | null;
  normal?: string | null;
  roughness?: string | null;
  height?: string | null;
  clouds?: string | null;
  atmosphere?: string | null;
  rings?: string | null;
  radarSurface?: string | null;
}

export interface ProvenanceMetadata {
  organization: string;
  mission?: string;
  url?: string;
  referencePage?: string;
  license: string;
  usageNotes: string;
  isCatalogImport?: boolean;
  snapshotFile?: string;
  rawRecord?: ExoplanetCatalogRecord;
}

export interface CelestialBodyData {
  id: string;
  name: string;
  systemId: ReferenceFrameId;
  systemName: string;
  category: 'solar-system' | 'exoplanet';
  type: string;
  description: string;
  primaryEvidence: EvidenceCategory;
  disclaimer?: string;
  scientificData: DetailedScientificMeasurements;
  visualScale: VisualScaleParameters;
  assets: AssetMapCollection;
  source: ProvenanceMetadata;
}

export interface StellarParameters {
  name: string;
  spectralType: string;
  effectiveTemperatureK: number;
  luminositySolar: number;
  lightColor: string;
  lightIntensity: number;
  worldPosition: [number, number, number];
}

export type InfoPanelMode = 'collapsed' | 'summary' | 'expanded';

export interface DiagnosticMetrics {
  activeLODLevel: 'DISTANT' | 'ORBITAL' | 'CLOSE';
  textureDimensions: string;
  textureLoadStatus: 'Ready (Cached)' | 'Streaming Asynchronous LOD...' | 'Initial' | 'Fallback';
  gpuMaxTextureSize: number;
  cameraDistanceRadii: number;
  cameraDistanceUnits: number;
  supports8KClose: boolean;
}
