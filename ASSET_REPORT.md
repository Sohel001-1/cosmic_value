# COSMIC VALUE: Planetary Asset Library Report
### NASA Space Apps Challenge Project Asset Inventory & Integration Guide

> **Notice**: All Solar System assets have been harvested from public domain NASA, JPL-Caltech, USGS Astrogeology Science Center, and Creative Commons open-science cartographic processing teams (e.g. Stellarium open-source cartography). No proprietary NASA Eyes code, branding logos, or private endpoints were scraped or utilized.

---

## 1. Executive Summary

- **Total Solar System Bodies Processed**: 26 (8 Planets, 1 Dwarf Planet, 16 Moons, 1 Deep Starfield Panorama)
- **Total Procedural Exoplanet Archetypes**: 12 Archetypes (covering all NASA Exoplanet Archive visual regimes)
- **Total Optimized Runtime Files**: 164 files
- **Total Runtime Asset Footprint**: 8036.11 KB (~7.85 MB)
- **Standard Format**: WebP (2:1 Equirectangular Cylindrical projection for Three.js `SphereGeometry`)
- **Resolution Standards**: Preview (512x256), Medium/Standard (2048x1024), Ultra-High (4096x2048 for key bodies where source exists)

---

## 2. Solar System Assets Inventory & Provenance

| Body | Category | Type | Color Map | Normal Map | Cloud Map | Rings | Source Organization & Mission | License / Attribution |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mercury** | `solar-system` | rocky | ✅ Yes | — | — | — | NASA / JPL / JHUAPL / Carnegie Institution of Washington (MESSENGER (Mercury Dual Imaging System)) | Public Domain (NASA/USGS) / CC-BY 4.0 (cartographic processing) |
| **Venus** | `solar-system` | terrestrial | ✅ Yes | — | — | — | NASA / JPL-Caltech / USGS (Magellan Synthetic Aperture Radar (SAR) & Pioneer Venus Orbiter) | Public Domain (NASA/JPL) |
| **Earth** | `solar-system` | habitable-ocean | ✅ Yes | — | ✅ Yes | — | NASA Goddard Space Flight Center / Visible Earth Team (Terra / Aqua MODIS (Blue Marble Next Generation)) | Public Domain (NASA / Reto Stockli) |
| **Mars** | `solar-system` | desert-rocky | ✅ Yes | — | — | — | NASA / JPL / USGS Astrogeology Science Center (Viking Orbiter 1 & 2 / Mars Global Surveyor MOLA) | Public Domain (NASA / USGS) |
| **Jupiter** | `solar-system` | gas-giant | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute / CICLOPS (Cassini Imaging Science Subsystem (ISS) Jupiter Flyby) | Public Domain (NASA/JPL/SSI) / James Hastings-Trew |
| **Saturn** | `solar-system` | gas-giant | ✅ Yes | — | — | ✅ Yes | NASA / JPL / Space Science Institute (Cassini-Huygens Mission) | Public Domain (NASA/JPL/SSI) |
| **Uranus** | `solar-system` | ice-giant | ✅ Yes | — | — | ✅ Yes | NASA / JPL (Voyager 2 Planetary Encounter) | Public Domain (NASA/JPL) |
| **Neptune** | `solar-system` | ice-giant | ✅ Yes | — | — | ✅ Yes | NASA / JPL (Voyager 2 Neptune Encounter) | Public Domain (NASA/JPL) |
| **Pluto** | `solar-system` | dwarf-planet | ✅ Yes | — | — | — | NASA / Johns Hopkins University Applied Physics Laboratory / Southwest Research Institute (New Horizons (LORRI / Ralph MVIC)) | Public Domain (NASA/JHUAPL/SwRI) / Kexitt & Oleg Pluton CC-BY 4.0 |
| **Moon** | `moons` | lunar-rocky | ✅ Yes | ✅ Yes | — | — | NASA / GSFC / Arizona State University (Lunar Reconnaissance Orbiter (LROC WAC + LOLA Altimeter)) | Public Domain (NASA / SVS / Ruslan Kabatsayev CC-BY-SA 4.0) |
| **Io** | `moons` | volcanic-sulfur | ✅ Yes | — | — | — | NASA / JPL / University of Arizona / USGS (Galileo Solid State Imaging (SSI) & Voyager 1/2) | Public Domain (NASA / JPL / USGS) |
| **Europa** | `moons` | ocean-ice | ✅ Yes | — | — | — | NASA / JPL / DLR / USGS (Galileo SSI & Voyager 2) | Public Domain (NASA / JPL) / Oleg Pluton CC-BY 4.0 |
| **Ganymede** | `moons` | icy-differentiated | ✅ Yes | — | — | — | NASA / JPL / USGS Astrogeology (Galileo & Voyager Missions) | Public Domain (NASA / USGS) / Oleg Pluton CC-BY 4.0 |
| **Callisto** | `moons` | cratered-ice | ✅ Yes | — | — | — | NASA / JPL / Planetary Data System (PDS) (Galileo SSI & Voyager) | Public Domain (NASA/PDS) / John van Vliet |
| **Titan** | `moons` | dense-atmosphere-organic | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute / University of Arizona (Cassini VIMS & ISS Infrared) | Public Domain (NASA / JPL / SSI) / Magenta Meteorite & Oleg Pluton CC-BY 4.0 |
| **Enceladus** | `moons` | cryovolcanic-ice | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute (CICLOPS Team) (Cassini Imaging Science Subsystem) | Public Domain (NASA / CICLOPS / RVS) |
| **Iapetus** | `moons` | two-tone-ice | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute (Cassini ISS) | Public Domain (NASA/JPL) / Dr. Fridger Schrempp |
| **Rhea** | `moons` | cratered-ice | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute (Cassini ISS) | Public Domain (NASA / SSI) / FarGetaNik & Oleg Pluton CC-BY 4.0 |
| **Mimas** | `moons` | cratered-ice | ✅ Yes | — | — | — | NASA / JPL / Space Science Institute (Cassini ISS) | Public Domain (NASA / JPL / SSI) |
| **Titania** | `moons` | faulted-ice | ✅ Yes | — | — | — | NASA / JPL (Voyager 2 Uranus Encounter) | Public Domain (NASA/JPL) / Kexitt & Oleg Pluton CC-BY 4.0 |
| **Oberon** | `moons` | cratered-ice | ✅ Yes | — | — | — | NASA / JPL (Voyager 2 Encounter) | Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0 |
| **Ariel** | `moons` | tectonic-ice | ✅ Yes | — | — | — | NASA / JPL (Voyager 2) | Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0 |
| **Umbriel** | `moons` | dark-cratered-ice | ✅ Yes | — | — | — | NASA / JPL (Voyager 2) | Public Domain (NASA/JPL) / Kexitt & Oleg Pluton CC-BY 4.0 |
| **Miranda** | `moons` | chaotic-terrain | ✅ Yes | — | — | — | NASA / JPL (Voyager 2 Close Flyby) | Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0 |
| **Triton** | `moons` | captured-kuiper-ice | ✅ Yes | — | — | — | NASA / JPL / USGS Astrogeology (Voyager 2 Neptune Encounter) | Public Domain (NASA/USGS) |
| **Deep Starfield & Milky Way** | `environments` | skybox-panorama | ✅ Yes | — | — | — | NASA / ESO / Axel Mellinger (All-Sky Optical Survey / Tycho-2 Catalogue) | Creative Commons Attribution 4.0 International (Axel Mellinger / ESO) |

---

## 3. Procedural Exoplanet Visual Archetypes

Because direct resolved surface imagery of exoplanets is physically unattainable with current astronomical instrumentation, the project uses mathematical 3D spherical noise simulations tailored to known exoplanet physical parameter classes (temperature, mass, radius, composition).

**Mandatory UI Disclaimer**:
> *"Model visualization based on available planetary parameters. Not a direct image."*

| Archetype ID | Archetype Name | Physical Regime & Surface Description | Included Maps | Color Palette Profile |
| :--- | :--- | :--- | :--- | :--- |
| `rocky` | **Rocky Terrestrial World** | Silicate-crusted rocky planet with varied basaltic topography and rugged highlands. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `cratered-rocky` | **Cratered Rocky World** | Airless body with severe impact saturation, rayed ejecta blankets, and ancient highlands. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `super-earth` | **Super-Earth** | Massive terrestrial world with vast tectonic plates, continents, deep oceans, and dynamic atmospheric cloud bands. | Color, Normal, Roughness, Height, Clouds | Seamless 3D Spherical Noise |
| `lava` | **Lava World** | Ultra-hot rocky world with dark molten basalt plates and glowing silicate/magma fissures. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `desert` | **Desert World** | Arid planet dominated by extensive dune fields, iron oxide badlands, and canyon networks. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `ocean` | **Ocean-like Hypothetical World** | Water-dominated planet with global deep oceans, submerged reefs, and polar ice shelves. | Color, Normal, Roughness, Height, Clouds | Seamless 3D Spherical Noise |
| `ice` | **Ice World** | Frozen cryo-world with fractured nitrogen/methane ice plains and translucent blue glacial chasms. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `mini-neptune` | **Mini-Neptune** | Volatile-rich sub-Neptune with deep hydrogen-helium atmosphere, turquoise haze, and atmospheric eddy currents. | Color, Normal, Roughness, Height, Clouds | Seamless 3D Spherical Noise |
| `neptune-like` | **Neptune-like** | Deep azure ice giant with pronounced atmospheric circulation belts and bright methane ice clouds. | Color, Normal, Roughness, Height, Clouds | Seamless 3D Spherical Noise |
| `gas-giant` | **Gas Giant** | Massive Jovian world featuring turbulent zonal jet streams, anticyclonic vortex storms, and ammonia-hydrosulfide cloud decks. | Color, Normal, Roughness, Height, Clouds | Seamless 3D Spherical Noise |
| `hot-jupiter` | **Hot Jupiter** | Gas giant in ultra-short period orbit subjected to extreme stellar insolation, silicate vapor clouds, and dramatic day-night temperature gradients. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |
| `unknown` | **Unknown / Unclassified Visual Archetype** | Unclassified candidate exoplanet rendered with neutral balanced spectroscopic placeholder visualization. | Color, Normal, Roughness, Height | Seamless 3D Spherical Noise |

---

## 4. Directory Structure

```
cosmic_value_assets/
├── assets-source/                     # Raw untouched downloads (preserves original provenance)
│   ├── solar-system/
│   │   ├── mercury/ (source_color.png)
│   │   ├── venus/
│   │   ├── earth/
│   │   ├── mars/
│   │   ├── jupiter/
│   │   ├── saturn/
│   │   ├── uranus/
│   │   ├── neptune/
│   │   └── pluto/
│   ├── moons/                         # 16 moons (moon, io, europa, ganymede, callisto, titan, etc.)
│   └── environments/
├── public/
│   └── assets/
│       ├── solar-system/              # WebP runtime textures (color.webp, preview.webp, high.webp)
│       ├── moons/                     # WebP runtime textures for all 16 moons
│       ├── procedural/                # 12 Procedural archetypes (color, normal, roughness, height, clouds)
│       ├── environments/stars/        # Milky Way & deep starfield background
│       └── metadata/                  # Individual body and archetype JSON descriptors
├── src/
│   └── data/
│       └── solarSystemAssets.json     # Master unified JSON data file for Three.js / React Three Fiber
├── ASSET_MANIFEST.json                # Complete machine-readable asset manifest with file sizes & hashes
└── ASSET_REPORT.md                    # Detailed verification & integration report
```


---

## 5. Three.js / React Three Fiber Integration Guide

### A. Equirectangular Sphere Mapping

All planetary textures are rendered in 2:1 equirectangular cylindrical projection. Apply them directly to Three.js `SphereGeometry`:

```javascript
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

export function Planet({ assetData }) {
  const [colorMap, normalMap, cloudsMap] = useLoader(TextureLoader, [
    assetData.assets.color,
    assetData.assets.normal || '/assets/procedural/rocky/normal.webp',
    assetData.assets.clouds || null
  ].filter(Boolean));

  // Ensure sRGB color space encoding
  if (colorMap) colorMap.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      {/* Planetary Surface */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={assetData.assets.normal ? normalMap : null}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmospheric Cloud Layer (if present) */}
      {cloudsMap && (
        <mesh scale={[1.015, 1.015, 1.015]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial
            map={cloudsMap}
            transparent={true}
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
```

### B. Seam & Polar Distortion Validation

- **Horizontal Seam (u = 0 / 1)**: All textures were verified to align horizontally without discontinuities across the $0^\circ \leftrightarrow 360^\circ$ meridian.

- **Polar Pinching**: The procedural generator samples 3D unit sphere space vectors $(\cos\phi \cos\theta, \cos\phi \sin\theta, \sin\phi)$ to eliminate polar artifacts.

- **Texture Orientation**: North pole at top ($v = 1$), prime meridian at center ($u = 0.5$).


---

## 6. Missing Assets & Legitimate Scientific Derivations

- **Normal / Elevation Maps for Outer Moons**: NASA and USGS missions (Voyager 2, Galileo, Cassini) captured extensive single-band and visible mosaics, but global high-resolution digital elevation models (DEMs) are only scientifically established for Earth, Moon (LOLA), Mars (MOLA), and Mercury (MESSENGER). In accordance with instructions, scientific normal maps were **not fabricated** for bodies lacking authentic altimetry data; `normal` is set to `null` in metadata.

- **Venus Clouds vs Surface**: The primary color map provides radar-penetrating surface topography. The thick sulfuric atmosphere can be represented via standard procedural Rayleigh scattering shaders.


---

## 7. Legal, Licensing & Reuse Guidelines

1. **NASA & JPL Public Domain**: Works produced by NASA and USGS civil servants are in the public domain and free for educational, scientific, and public visualization under 17 U.S.C. § 105.

2. **Cartographic Post-Processing Attribution**: Cartographic mosaics processed by Oleg Pluton, James Hastings-Trew, and Axel Mellinger are licensed under Creative Commons Attribution (CC-BY 4.0). Credit is explicitly recorded in `ASSET_MANIFEST.json` and `solarSystemAssets.json`.

3. **NASA Logo & Branding**: No NASA insignia ('meatball'), NASA logotype ('worm'), or NASA seal are included in the product.

4. **NASA Eyes Distinction**: This project is built completely independently without proprietary NASA Eyes JavaScript code, internal shaders, or private telemetry APIs.
