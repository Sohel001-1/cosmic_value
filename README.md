# COSMIC VALUE — 3D Planetary & Exoplanet Explorer

An interactive, high-fidelity 3D astronomical visualization platform built with **React Three Fiber**, **Three.js**, and **TypeScript**. 

Explore the complete Solar System—featuring the Sun, all eight planets, dwarf planets, multi-body rings, and atmospheric cloud decks—alongside a searchable database of **6,366 NASA-confirmed exoplanets** rendered with physically grounded procedural shaders and astronomical telemetry.

---

## Features

- **Complete Solar System Simulation**:
  - Central host star (the Sun) with dynamic corona and additive atmospheric scattering.
  - All 8 major planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) plus Pluto in accurate orbital scales.
  - Interactive multi-layer planetary meshes:
    - **Earth**: Dynamic rotating cloud deck with authentic grayscale alpha-mask transparency over continental oceans.
    - **Venus**: Sulfuric acid cloud deck with toggleable Magellan radar topography mode.
    - **Saturn, Uranus, Neptune**: High-fidelity planetary ring geometries with accurate axial tilts and alpha transparency.
- **Searchable NASA Exoplanet Catalog**:
  - Authoritative snapshot of 6,366 confirmed exoplanets (`default_flag = 1`) from the NASA Exoplanet Archive.
  - Search and filter by discovery method (Transit, Radial Velocity, Direct Imaging, Microlensing, etc.), host star, year, mass, radius, and equilibrium temperature.
  - Continuous cinematic camera transitions that smoothly travel between interplanetary reference frames.
  - Deterministic procedural PBR materials tailored to distinct visual families (Terrestrial Rocky, Sub-Neptune / Mini-Neptune, Jovian Gas Giants, Irradiated Hot Jupiters).
- **Interactive HUD & Science Panels**:
  - Restrained, screen-space bounded planetary labels with hover cards and inspection triggers.
  - Collapsible three-mode scientific telemetry panel (Summary, Expanded, Collapsed) displaying semi-major axes, eccentricities, orbital periods, densities, and published literature citations.
  - Real-time performance diagnostics HUD (FPS, memory, draw calls, camera distance).

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your computer:

- **[Node.js](https://nodejs.org/)**: Version `18.0.0` or higher (Node 20 or 22 LTS recommended)
- **npm** (comes bundled with Node.js) or **yarn** / **pnpm**
- A modern web browser with **WebGL 2.0** support (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, or Safari)

---

### Installation & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sohel001-1/cosmic_value.git
   cd cosmic_value
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port indicated in your terminal).

---

### Production Build & Local Preview

To compile an optimized production bundle and verify the build:

```bash
# 1. Type check and build production assets
npm run build

# 2. Preview the production build locally
npm run preview
```

The production output will be generated inside the `dist/` directory.

---

## Exoplanet Catalog Data Pipeline

The project includes both the pre-built web catalog payload and the complete raw source data:

- **Browser Runtime Payload**: `public/data/exoplanet_catalog.json` (~9.98 MB, loaded asynchronously on demand).
- **Raw NASA Archive Snapshot**: `data/raw/PS_2026.09.20_10.52.04.csv` (Planetary Systems composite table from September 20, 2026).

To re-run the conversion pipeline or re-generate the JSON catalog:

```bash
npm run import:catalog
```

For detailed data provenance, column mappings, and instructions on pulling new snapshots via the NASA TAP API, see [`data/README.md`](data/README.md).

---

## User Controls & Navigation

| Control | Action |
| :--- | :--- |
| **Left Click + Drag** | Orbit and rotate the camera around the active focal center |
| **Scroll Wheel / Pinch** | Zoom in for close planetary inspection or zoom out to system overview |
| **Click on Planet / Label** | Focus the camera and initiate a smooth flight transition to that world |
| **Orbits Button (HUD)** | Toggle hairline orbital trajectory guides on/off |
| **Labels Button (HUD)** | Toggle floating planetary identification markers on/off |
| **Diagnostics Button (HUD)** | Toggle real-time WebGL rendering and camera metrics |
| **Catalog Button (HUD)** | Open the searchable database of 6,366 confirmed exoplanets |
| **Reset View Button (HUD)** | Return the camera to the high-level Solar System Overview |

---

## Project Structure

```text
cosmic_value/
├── data/
│   ├── raw/                       # Authoritative NASA Exoplanet CSV snapshot
│   └── README.md                  # Dataset provenance and TAP API query guide
├── public/
│   ├── assets/
│   │   ├── solar-system/          # 8K/4K planetary surface textures & clouds
│   │   ├── procedural/            # Procedural noise and surface height maps
│   │   └── models/rings/          # Planetary ring alpha transparency textures
│   └── data/
│       └── exoplanet_catalog.json # Optimized browser catalog (6,366 planets)
├── scripts/
│   ├── import_exoplanet_catalog.js # Reproducible CSV-to-JSON import pipeline
│   ├── verify_catalog.js          # Catalog integrity and schema validator
│   └── verify_variety_and_travel.js # Target planet flight vector verifier
├── src/
│   ├── components/
│   │   ├── 3d/                    # R3F meshes, OrbitPath, CameraController, frames
│   │   └── ui/                    # HUD, CatalogSearchModal, PlanetInfoPanel
│   ├── data/                      # Solar System telemetry, curated catalog data
│   ├── store/                     # Zustand state management (useExplorerStore)
│   ├── types/                     # TypeScript definitions for astronomy & UI
│   └── utils/                     # Exoplanet adapters, procedural seeds, math
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Technology Stack

- **Core Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/)
- **UI Icons**: [Lucide React](https://lucide.dev/)
- **Build Tooling**: [Vite 5](https://vitejs.dev/)

---

## License & Data Attribution

- **Scientific Data**: Courtesy of the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/), operated by the California Institute of Technology under contract with the National Aeronautics and Space Administration.
- **Imagery & Maps**: Surface imagery derived from NASA/JPL-Caltech, USGS Astrogeology Science Center, and MESSENGER/Cassini missions (Public Domain).
