import { create } from 'zustand';
import { CELESTIAL_BODIES, STELLAR_HOSTS } from '../data/explorerCatalog';
import {
  CelestialBodyData,
  StellarParameters,
  ReferenceFrameId,
  InfoPanelMode,
  DiagnosticMetrics,
} from '../types/explorer';
import {
  ExoplanetCatalogRecord,
  ExoplanetCatalogPayload,
  CatalogFilterState,
} from '../types/exoplanet';
import {
  adaptExoplanetRecordToCelestialBody,
  computeStellarParameters,
} from '../utils/exoplanetAdapter';

interface ExplorerState {
  // Active Destination Celestial Body & Spatial Reference Frame
  activeFrameId: ReferenceFrameId;
  renderedFrameId: ReferenceFrameId;
  selectedBodyId: string;
  selectedBody: CelestialBodyData;
  hostStar: StellarParameters;

  // Departing (Outgoing) Body held visually during continuous cinematic transitions
  departingBody: CelestialBodyData | null;
  departingHost: StellarParameters | null;

  // Camera & Smooth Continuous Transition State
  isTransitioning: boolean;

  // Diagnostics Data
  diagnostics: DiagnosticMetrics;

  // Catalog State
  catalog: ExoplanetCatalogRecord[];
  catalogMetadata: ExoplanetCatalogPayload['metadata'] | null;
  isLoadingCatalog: boolean;
  catalogError: string | null;
  isCatalogOpen: boolean;
  catalogFilter: CatalogFilterState;

  // HUD & UI States
  infoPanelMode: InfoPanelMode;
  showDiagnostics: boolean;
  showLabels: boolean;
  showOrbits: boolean;
  venusViewMode: 'visible' | 'radar';

  // Actions
  loadCatalog: () => Promise<void>;
  openCatalog: () => void;
  closeCatalog: () => void;
  toggleCatalog: () => void;
  setCatalogFilter: (filter: Partial<CatalogFilterState>) => void;
  resetCatalogFilter: () => void;
  selectBody: (id: string) => void;
  selectCatalogPlanet: (planetName: string) => void;
  clearDepartingBody: () => void;
  setInfoPanelMode: (mode: InfoPanelMode) => void;
  toggleInfoPanel: () => void;
  toggleDiagnostics: () => void;
  toggleLabels: () => void;
  toggleOrbits: () => void;
  setVenusViewMode: (mode: 'visible' | 'radar') => void;
  toggleVenusViewMode: () => void;
  setTransitioning: (transitioning: boolean) => void;
  setRenderedFrameId: (frameId: ReferenceFrameId) => void;
  updateDiagnostics: (metrics: Partial<DiagnosticMetrics>) => void;
  resetView: () => void;
}

const initialFilterState: CatalogFilterState = {
  searchQuery: '',
  discoveryMethod: 'ALL',
  massType: 'ALL',
  minYear: null,
  maxYear: null,
  minRadius: null,
  maxRadius: null,
  minDistance: null,
  maxDistance: null,
  minTemp: null,
  maxTemp: null,
  sortBy: 'name',
  sortOrder: 'asc',
};

export const useExplorerStore = create<ExplorerState>((set, get) => {
  const initialBody =
    CELESTIAL_BODIES['solar-system-overview'] || CELESTIAL_BODIES['mercury'];
  const initialHost = STELLAR_HOSTS[initialBody.systemId];

  return {
    activeFrameId: initialBody.systemId,
    renderedFrameId: initialBody.systemId,
    selectedBodyId: 'solar-system-overview',
    selectedBody: initialBody,
    hostStar: initialHost,

    departingBody: null,
    departingHost: null,

    isTransitioning: false,

    diagnostics: {
      activeLODLevel: 'DISTANT',
      textureDimensions: '1024 × 512 px',
      textureLoadStatus: 'Initial',
      gpuMaxTextureSize: 16384,
      cameraDistanceRadii: 3.5,
      cameraDistanceUnits: 5.6,
      supports8KClose: true,
    },

    catalog: [],
    catalogMetadata: null,
    isLoadingCatalog: false,
    catalogError: null,
    isCatalogOpen: false,
    catalogFilter: initialFilterState,

    infoPanelMode: 'summary',
    showDiagnostics: false,
    showLabels: true,
    showOrbits: true,
    venusViewMode: 'visible',

    setVenusViewMode: (mode) => set({ venusViewMode: mode }),
    toggleVenusViewMode: () =>
      set((state) => ({
        venusViewMode: state.venusViewMode === 'visible' ? 'radar' : 'visible',
      })),

    loadCatalog: async () => {
      if (get().catalog.length > 0 || get().isLoadingCatalog) return;
      set({ isLoadingCatalog: true, catalogError: null });
      try {
        const res = await fetch('/data/exoplanet_catalog.json');
        if (!res.ok) {
          throw new Error(`Failed to fetch catalog: HTTP ${res.status}`);
        }
        const data: ExoplanetCatalogPayload = await res.json();
        set({
          catalog: data.planets,
          catalogMetadata: data.metadata,
          isLoadingCatalog: false,
        });
      } catch (err: any) {
        console.error('[Catalog Store] Failed to load catalog JSON:', err);
        set({
          isLoadingCatalog: false,
          catalogError: err.message || 'Error loading catalog',
        });
      }
    },

    openCatalog: () => {
      set({ isCatalogOpen: true });
      get().loadCatalog();
    },

    closeCatalog: () => set({ isCatalogOpen: false }),

    toggleCatalog: () => {
      const next = !get().isCatalogOpen;
      set({ isCatalogOpen: next });
      if (next) get().loadCatalog();
    },

    setCatalogFilter: (partial) =>
      set((state) => ({
        catalogFilter: { ...state.catalogFilter, ...partial },
      })),

    resetCatalogFilter: () => set({ catalogFilter: initialFilterState }),

    selectBody: (id: string) => {
      const current = get();
      if (current.selectedBodyId === id) return;

      const curated = CELESTIAL_BODIES[id];
      if (curated) {
        set({
          departingBody: current.selectedBody,
          departingHost: current.hostStar,
          activeFrameId: curated.systemId,
          selectedBodyId: id,
          selectedBody: curated,
          hostStar: STELLAR_HOSTS[curated.systemId] || current.hostStar,
          isTransitioning: true,
        });
        return;
      }

      const foundInCatalog = current.catalog.find(
        (p) => p.name.toLowerCase() === id.toLowerCase() || p.name === id
      );
      if (foundInCatalog) {
        get().selectCatalogPlanet(foundInCatalog.name);
      }
    },

    selectCatalogPlanet: (planetName: string) => {
      const current = get();
      const record = current.catalog.find((p) => p.name === planetName);
      if (!record) return;

      if (record.name === 'TOI-700 d') {
        const toi700Curated = CELESTIAL_BODIES['super-earth'];
        set({
          departingBody: current.selectedBody,
          departingHost: current.hostStar,
          activeFrameId: toi700Curated.systemId,
          selectedBodyId: 'super-earth',
          selectedBody: toi700Curated,
          hostStar: STELLAR_HOSTS['toi-700'],
          isTransitioning: true,
          isCatalogOpen: false,
        });
        return;
      }

      const adaptedBody = adaptExoplanetRecordToCelestialBody(record);
      const adaptedHost = computeStellarParameters(record);

      set({
        departingBody: current.selectedBody,
        departingHost: current.hostStar,
        activeFrameId: adaptedBody.systemId,
        selectedBodyId: adaptedBody.id,
        selectedBody: adaptedBody,
        hostStar: adaptedHost,
        isTransitioning: true,
        isCatalogOpen: false,
      });
    },

    clearDepartingBody: () => set({ departingBody: null, departingHost: null }),

    setInfoPanelMode: (mode) => set({ infoPanelMode: mode }),

    toggleInfoPanel: () => {
      const current = get().infoPanelMode;
      if (current === 'collapsed') {
        set({ infoPanelMode: 'summary' });
      } else if (current === 'summary') {
        set({ infoPanelMode: 'expanded' });
      } else {
        set({ infoPanelMode: 'collapsed' });
      }
    },

    toggleDiagnostics: () => set((state) => ({ showDiagnostics: !state.showDiagnostics })),
    toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
    toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),

    setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
    setRenderedFrameId: (frameId) => set({ renderedFrameId: frameId }),

    updateDiagnostics: (metrics) =>
      set((state) => ({
        diagnostics: { ...state.diagnostics, ...metrics },
      })),

    resetView: () => {
      set({ isTransitioning: true });
    },
  };
});

if (typeof window !== 'undefined') {
  (window as any).__EXPLORER_STORE__ = useExplorerStore;
}
