export interface StructuredReference {
  label: string;
  url: string | null;
  rawKey: string | null;
}

export interface ValueWithUncertainty<T = number> {
  value: T | null;
  err1?: number | null;
  err2?: number | null;
  lim?: number | null;
}

export interface MassValueWithProvenance extends ValueWithUncertainty<number> {
  provenance?: string | null; // 'Mass', 'Msini', 'Mass-Radius'
}

export interface StellarData {
  reference: StructuredReference | null;
  spectralType: string | null;
  teffK: ValueWithUncertainty<number>;
  radiusSolar: ValueWithUncertainty<number>;
  massSolar: ValueWithUncertainty<number>;
  metallicityDex: ValueWithUncertainty<number>;
  luminosityLogSolar: ValueWithUncertainty<number>;
}

export interface ExoplanetCatalogRecord {
  name: string;
  hostname: string;
  numStars: number | null;
  numPlanets: number | null;
  isCircumbinary: boolean;
  discoveryMethod: string | null;
  discoveryYear: number | null;
  discoveryFacility: string | null;
  discoveryTelescope: string | null;
  isControversial: boolean;
  planetReference: StructuredReference | null;
  orbitalPeriodDays: ValueWithUncertainty<number>;
  semiMajorAxisAu: ValueWithUncertainty<number>;
  radiusEarths: ValueWithUncertainty<number>;
  massEarths: MassValueWithProvenance;
  densityGcm3: ValueWithUncertainty<number>;
  eccentricity: ValueWithUncertainty<number>;
  insolationFluxEarths: ValueWithUncertainty<number>;
  equilibriumTempK: ValueWithUncertainty<number>;
  stellar: StellarData;
  distancePc: ValueWithUncertainty<number>;
  rowUpdate: string | null;
  publicationDate: string | null;
  numSpectra: {
    eclipse: number;
    transmission: number;
    directImaging: number;
  };
}

export interface ExoplanetCatalogPayload {
  metadata: {
    snapshotFile: string;
    snapshotDate: string;
    importedAt: string;
    sourceArchive: string;
    totalPlanets: number;
    license: string;
    querySummary: string;
  };
  planets: ExoplanetCatalogRecord[];
}

export interface CatalogFilterState {
  searchQuery: string;
  discoveryMethod: string | 'ALL';
  massType: 'ALL' | 'Mass' | 'Msini' | 'Mass-Radius';
  minYear: number | null;
  maxYear: number | null;
  minRadius: number | null;
  maxRadius: number | null;
  minDistance: number | null;
  maxDistance: number | null;
  minTemp: number | null;
  maxTemp: number | null;
  sortBy: 'name' | 'distance' | 'radius' | 'mass' | 'period' | 'discYear';
  sortOrder: 'asc' | 'desc';
}
