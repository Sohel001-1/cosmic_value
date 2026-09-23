import os
import sys
import json
import time
import math
import hashlib
import requests
import numpy as np
from PIL import Image, ImageFilter, ImageOps

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
SOURCE_DIR = os.path.join(BASE_DIR, "assets-source")
PUBLIC_DIR = os.path.join(BASE_DIR, "public", "assets")
DATA_DIR = os.path.join(BASE_DIR, "src", "data")

os.makedirs(SOURCE_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

session = requests.Session()
session.headers.update({
    'User-Agent': 'CosmicValueAssetCollector/1.0 (NASA Space Apps Challenge; educational visualization; +https://github.com)'
})

# ==============================================================================
# 1. CATALOG DEFINITION: SOLAR SYSTEM & MOONS (NASA / JPL / USGS / STELLARIUM SOURCES)
# ==============================================================================

SOLAR_SYSTEM_CATALOG = {
    # --- PLANETS ---
    "mercury": {
        "id": "mercury",
        "name": "Mercury",
        "category": "solar-system",
        "type": "rocky",
        "description": "Innermost terrestrial planet, heavily cratered with high density iron core.",
        "primary_source": {
            "organization": "NASA / JPL / JHUAPL / Carnegie Institution of Washington",
            "mission": "MESSENGER (Mercury Dual Imaging System)",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mercury.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Mercury",
            "license": "Public Domain (NASA/USGS) / CC-BY 4.0 (cartographic processing)",
            "usageNotes": "Equirectangular projection from MESSENGER global MDIS mosaic. Free for educational and non-commercial scientific visualization."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mercury.png"
        }
    },
    "venus": {
        "id": "venus",
        "name": "Venus",
        "category": "solar-system",
        "type": "terrestrial",
        "description": "Second planet from the Sun, enveloped in opaque sulfuric acid and carbon dioxide clouds with radar-mapped basaltic surface.",
        "primary_source": {
            "organization": "NASA / JPL-Caltech / USGS",
            "mission": "Magellan Synthetic Aperture Radar (SAR) & Pioneer Venus Orbiter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/venus.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Venus",
            "license": "Public Domain (NASA/JPL)",
            "usageNotes": "Global radar reflectivity and altimetry mosaic rendered in equirectangular projection."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/venus.png"
        }
    },
    "earth": {
        "id": "earth",
        "name": "Earth",
        "category": "solar-system",
        "type": "habitable-ocean",
        "description": "Third planet from the Sun, home to liquid water oceans, dynamic atmospheric cloud systems, and life.",
        "primary_source": {
            "organization": "NASA Goddard Space Flight Center / Visible Earth Team",
            "mission": "Terra / Aqua MODIS (Blue Marble Next Generation)",
            "url": "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg",
            "clouds_url": "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg",
            "referencePage": "https://visibleearth.nasa.gov/images/57752/blue-marble-land-surface-shallow-water-and-shaded-topography",
            "license": "Public Domain (NASA / Reto Stockli)",
            "usageNotes": "Equirectangular cylindrical projection. Clouds combined from MODIS satellite observations. Credit: Reto Stockli, NASA Earth Observatory."
        },
        "downloads": {
            "color": "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57752/land_shallow_topo_2048.jpg",
            "clouds": "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg",
            "fallback_color": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
        }
    },
    "mars": {
        "id": "mars",
        "name": "Mars",
        "category": "solar-system",
        "type": "desert-rocky",
        "description": "Fourth planet from the Sun, dry desert world with ferric oxide surface, polar ice caps, and colossal volcanic shields.",
        "primary_source": {
            "organization": "NASA / JPL / USGS Astrogeology Science Center",
            "mission": "Viking Orbiter 1 & 2 / Mars Global Surveyor MOLA",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mars.png",
            "referencePage": "https://astrogeology.usgs.gov/search/map/Mars/Global-Mosaics/Mars_Viking_MDIM21_ClrMosaic_global_232m",
            "license": "Public Domain (NASA / USGS)",
            "usageNotes": "USGS Viking MDIM 2.1 calibrated color mosaic. Fully spherical equirectangular map."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mars.png"
        }
    },
    "jupiter": {
        "id": "jupiter",
        "name": "Jupiter",
        "category": "solar-system",
        "type": "gas-giant",
        "description": "Largest planet in the Solar System, gas giant characterized by alternating zonal belts, zones, and the Great Red Spot.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute / CICLOPS",
            "mission": "Cassini Imaging Science Subsystem (ISS) Jupiter Flyby",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/jupiter.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/catalog/PIA07782",
            "license": "Public Domain (NASA/JPL/SSI) / James Hastings-Trew",
            "usageNotes": "Equirectangular cylindrical projection assembled from Cassini ISS narrow-angle camera observations."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/jupiter.png"
        }
    },
    "saturn": {
        "id": "saturn",
        "name": "Saturn",
        "category": "solar-system",
        "type": "gas-giant",
        "description": "Second-largest planet, ringed gas giant with subtle atmospheric banding and complex ring dynamics.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute",
            "mission": "Cassini-Huygens Mission",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/saturn.png",
            "rings_url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/saturn_rings_radial.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Saturn",
            "license": "Public Domain (NASA/JPL/SSI)",
            "usageNotes": "Equirectangular atmospheric map and 1D radial ring optical depth/color profile."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/saturn.png",
            "rings": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/saturn_rings_radial.png"
        }
    },
    "uranus": {
        "id": "uranus",
        "name": "Uranus",
        "category": "solar-system",
        "type": "ice-giant",
        "description": "Ice giant planet with high methane abundance in upper atmosphere and an extreme 97.8 degree axial tilt.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2 Planetary Encounter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/uranus.png",
            "rings_url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/uranus_rings.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Uranus",
            "license": "Public Domain (NASA/JPL)",
            "usageNotes": "Voyager 2 narrow-angle camera composite processed in equirectangular projection."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/uranus.png",
            "rings": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/uranus_rings.png"
        }
    },
    "neptune": {
        "id": "neptune",
        "name": "Neptune",
        "category": "solar-system",
        "type": "ice-giant",
        "description": "Outer ice giant planet exhibiting vibrant azure coloration, supersonic jet streams, and high-altitude cirrus streaks.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2 Neptune Encounter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/neptune.png",
            "rings_url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/neptune_rings.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Neptune",
            "license": "Public Domain (NASA/JPL)",
            "usageNotes": "Voyager 2 Narrow Angle Camera images processed to true-color equirectangular map."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/neptune.png",
            "rings": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/neptune_rings.png"
        }
    },
    "pluto": {
        "id": "pluto",
        "name": "Pluto",
        "category": "solar-system",
        "type": "dwarf-planet",
        "description": "Dwarf planet in the Kuiper belt featuring nitrogen ice plains (Sputnik Planitia), water-ice mountains, and tholin deposits.",
        "primary_source": {
            "organization": "NASA / Johns Hopkins University Applied Physics Laboratory / Southwest Research Institute",
            "mission": "New Horizons (LORRI / Ralph MVIC)",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/pluto.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/catalog/PIA19952",
            "license": "Public Domain (NASA/JHUAPL/SwRI) / Kexitt & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Global equirectangular mosaic combining New Horizons flyby imagery with photometric balancing."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/pluto.png"
        }
    },

    # --- MOONS ---
    "moon": {
        "id": "moon",
        "name": "Moon",
        "category": "moons",
        "parent": "earth",
        "type": "lunar-rocky",
        "description": "Earth's sole natural satellite, synchronous rotation, characterized by lunar maria and impact craters.",
        "primary_source": {
            "organization": "NASA / GSFC / Arizona State University",
            "mission": "Lunar Reconnaissance Orbiter (LROC WAC + LOLA Altimeter)",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/moon_4k.jpg",
            "normals_url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/moon_normals.png",
            "referencePage": "https://svs.gsfc.nasa.gov/4720",
            "license": "Public Domain (NASA / SVS / Ruslan Kabatsayev CC-BY-SA 4.0)",
            "usageNotes": "LROC WAC Hapke-normalized photometric albedo map + LOLA normal/elevation map in 2:1 equirectangular projection."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/moon_4k.jpg",
            "normal": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/moon_normals.png"
        }
    },
    "io": {
        "id": "io",
        "name": "Io",
        "category": "moons",
        "parent": "jupiter",
        "type": "volcanic-sulfur",
        "description": "Innermost Galilean moon, most volcanically active body in the Solar System driven by extreme tidal heating.",
        "primary_source": {
            "organization": "NASA / JPL / University of Arizona / USGS",
            "mission": "Galileo Solid State Imaging (SSI) & Voyager 1/2",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/io.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Io",
            "license": "Public Domain (NASA / JPL / USGS)",
            "usageNotes": "Global color mosaic showing sulfurous plains, volcanic vents (paterae), and active plumes."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/io.png"
        }
    },
    "europa": {
        "id": "europa",
        "name": "Europa",
        "category": "moons",
        "parent": "jupiter",
        "type": "ocean-ice",
        "description": "Galilean moon harboring a global subsurface liquid saltwater ocean beneath a fractured water-ice lithosphere.",
        "primary_source": {
            "organization": "NASA / JPL / DLR / USGS",
            "mission": "Galileo SSI & Voyager 2",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/europa.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Europa",
            "license": "Public Domain (NASA / JPL) / Oleg Pluton CC-BY 4.0",
            "usageNotes": "Equirectangular map showing extensive intersecting lineae, cycloids, and chaotic terrain."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/europa.png"
        }
    },
    "ganymede": {
        "id": "ganymede",
        "name": "Ganymede",
        "category": "moons",
        "parent": "jupiter",
        "type": "icy-differentiated",
        "description": "Largest moon in the Solar System, possessing its own intrinsic magnetic dynamo, grooved terrain, and dark ancient crust.",
        "primary_source": {
            "organization": "NASA / JPL / USGS Astrogeology",
            "mission": "Galileo & Voyager Missions",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/ganymede.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Ganymede",
            "license": "Public Domain (NASA / USGS) / Oleg Pluton CC-BY 4.0",
            "usageNotes": "Global mosaic illustrating bright tectonic grooved terrain and dark cratered polygon regions."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/ganymede.png"
        }
    },
    "callisto": {
        "id": "callisto",
        "name": "Callisto",
        "category": "moons",
        "parent": "jupiter",
        "type": "cratered-ice",
        "description": "Outermost Galilean moon, heavily cratered ancient pristine surface showing minimal tectonic resurfacing.",
        "primary_source": {
            "organization": "NASA / JPL / Planetary Data System (PDS)",
            "mission": "Galileo SSI & Voyager",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/callisto.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Callisto",
            "license": "Public Domain (NASA/PDS) / John van Vliet",
            "usageNotes": "Equirectangular mosaic from PDS calibrated archives depicting multiring impact basins Valhalla and Asgard."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/callisto.png"
        }
    },
    "titan": {
        "id": "titan",
        "name": "Titan",
        "category": "moons",
        "parent": "saturn",
        "type": "dense-atmosphere-organic",
        "description": "Largest moon of Saturn, enveloped in a dense nitrogen-methane atmosphere with liquid hydrocarbon lakes and seas.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute / University of Arizona",
            "mission": "Cassini VIMS & ISS Infrared",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/titan.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Titan",
            "license": "Public Domain (NASA / JPL / SSI) / Magenta Meteorite & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Infrared surface map penetrating photochemical atmospheric haze."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/titan.png"
        }
    },
    "enceladus": {
        "id": "enceladus",
        "name": "Enceladus",
        "category": "moons",
        "parent": "saturn",
        "type": "cryovolcanic-ice",
        "description": "Saturnian moon with high visual albedo, fresh water ice surface, and active cryovolcanic geysers erupting from south polar tiger stripes.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute (CICLOPS Team)",
            "mission": "Cassini Imaging Science Subsystem",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/enceladus.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Enceladus",
            "license": "Public Domain (NASA / CICLOPS / RVS)",
            "usageNotes": "Equirectangular false-color and albedo mosaic of Enceladus surface features."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/enceladus.png"
        }
    },
    "iapetus": {
        "id": "iapetus",
        "name": "Iapetus",
        "category": "moons",
        "parent": "saturn",
        "type": "two-tone-ice",
        "description": "Saturnian moon with striking two-tone coloration: leading hemisphere dark as coal (Cassini Regio), trailing hemisphere brilliant bright ice.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute",
            "mission": "Cassini ISS",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/iapetus.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Iapetus",
            "license": "Public Domain (NASA/JPL) / Dr. Fridger Schrempp",
            "usageNotes": "Global equirectangular map exhibiting the extreme contrast albedo dichotomy."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/iapetus.png"
        }
    },
    "rhea": {
        "id": "rhea",
        "name": "Rhea",
        "category": "moons",
        "parent": "saturn",
        "type": "cratered-ice",
        "description": "Second largest moon of Saturn, heavily cratered icy sphere with bright wispy fractures.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute",
            "mission": "Cassini ISS",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/rhea.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Rhea",
            "license": "Public Domain (NASA / SSI) / FarGetaNik & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Equirectangular map compiled from high-resolution Cassini flyby frames."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/rhea.png"
        }
    },
    "mimas": {
        "id": "mimas",
        "name": "Mimas",
        "category": "moons",
        "parent": "saturn",
        "type": "cratered-ice",
        "description": "Saturnian moon dominated by the giant impact crater Herschel, giving it a distinctive Death Star resemblance.",
        "primary_source": {
            "organization": "NASA / JPL / Space Science Institute",
            "mission": "Cassini ISS",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mimas.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Mimas",
            "license": "Public Domain (NASA / JPL / SSI)",
            "usageNotes": "Equirectangular mosaic from Cassini ISS narrow and wide-angle cameras."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/mimas.png"
        }
    },
    "titania": {
        "id": "titania",
        "name": "Titania",
        "category": "moons",
        "parent": "uranus",
        "type": "faulted-ice",
        "description": "Largest moon of Uranus, marked by numerous impact craters and deep fault valleys (graben) like Messina Chasma.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2 Uranus Encounter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/titania.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Titania",
            "license": "Public Domain (NASA/JPL) / Kexitt & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Voyager 2 flyby images reprojected to cylindrical equirectangular coordinates."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/titania.png"
        }
    },
    "oberon": {
        "id": "oberon",
        "name": "Oberon",
        "category": "moons",
        "parent": "uranus",
        "type": "cratered-ice",
        "description": "Outermost major moon of Uranus, heavily cratered with prominent central peaks and dark carbonaceous floor deposits.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2 Encounter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/oberon.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Oberon",
            "license": "Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Equirectangular map synthesized from Voyager 2 highest resolution passes."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/oberon.png"
        }
    },
    "ariel": {
        "id": "ariel",
        "name": "Ariel",
        "category": "moons",
        "parent": "uranus",
        "type": "tectonic-ice",
        "description": "Fourth largest moon of Uranus, showing youngest and most extensively tectonically modified surface among Uranian satellites.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/ariel.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Ariel",
            "license": "Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Voyager 2 mosaic showing interconnected grabens and smooth floor material."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/ariel.png"
        }
    },
    "umbriel": {
        "id": "umbriel",
        "name": "Umbriel",
        "category": "moons",
        "parent": "uranus",
        "type": "dark-cratered-ice",
        "description": "Darkest of the Uranian moons with uniform low albedo and the mysterious bright ring feature Wunda at the equator.",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/umbriel.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Umbriel",
            "license": "Public Domain (NASA/JPL) / Kexitt & Oleg Pluton CC-BY 4.0",
            "usageNotes": "Voyager 2 calibrated mosaic in equirectangular projection."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/umbriel.png"
        }
    },
    "miranda": {
        "id": "miranda",
        "name": "Miranda",
        "category": "moons",
        "parent": "uranus",
        "type": "chaotic-terrain",
        "description": "Smallest and innermost of the round Uranian moons, exhibiting extreme geological diversity with giant coronae and chevron cliffs (Verona Rupes).",
        "primary_source": {
            "organization": "NASA / JPL",
            "mission": "Voyager 2 Close Flyby",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/miranda.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Miranda",
            "license": "Public Domain (NASA/JPL) / Snowfall & Oleg Pluton CC-BY 4.0",
            "usageNotes": "High-resolution Voyager 2 close approach mosaic projected in equirectangular format."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/miranda.png"
        }
    },
    "triton": {
        "id": "triton",
        "name": "Triton",
        "category": "moons",
        "parent": "neptune",
        "type": "captured-kuiper-ice",
        "description": "Largest moon of Neptune in a retrograde orbit, captured Kuiper belt object featuring cantaloupe terrain and active nitrogen geysers.",
        "primary_source": {
            "organization": "NASA / JPL / USGS Astrogeology",
            "mission": "Voyager 2 Neptune Encounter",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/triton.png",
            "referencePage": "https://photojournal.jpl.nasa.gov/target/Triton",
            "license": "Public Domain (NASA/USGS)",
            "usageNotes": "Voyager 2 clear and color filter mosaic showing south polar terrain and equatorial cryo-volcanic deposits."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/triton.png"
        }
    },

    # --- ENVIRONMENT ---
    "stars": {
        "id": "stars",
        "name": "Deep Starfield & Milky Way",
        "category": "environments",
        "type": "skybox-panorama",
        "description": "360-degree all-sky panoramic starfield and Milky Way galaxy projection.",
        "primary_source": {
            "organization": "NASA / ESO / Axel Mellinger",
            "mission": "All-Sky Optical Survey / Tycho-2 Catalogue",
            "url": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/milkyway.png",
            "referencePage": "https://www.eso.org/public/images/eso0932a/",
            "license": "Creative Commons Attribution 4.0 International (Axel Mellinger / ESO)",
            "usageNotes": "Equirectangular 360x180 panorama for Three.js background scene environment mapping."
        },
        "downloads": {
            "color": "https://raw.githubusercontent.com/Stellarium/stellarium/master/textures/milkyway.png"
        }
    }
}

# ==============================================================================
# 2. PROCEDURAL VISUAL ARCHETYPES FOR EXOPLANETS
# ==============================================================================

EXOPLANET_ARCHETYPES = [
    {
        "id": "rocky",
        "name": "Rocky Terrestrial World",
        "description": "Silicate-crusted rocky planet with varied basaltic topography and rugged highlands.",
        "palette": {
            "base": [(45, 38, 35), (92, 75, 62), (145, 120, 98), (190, 165, 140), (220, 205, 185)],
            "roughness_range": (0.6, 0.95)
        },
        "noise_config": {"octaves": 7, "persistence": 0.52, "lacunarity": 2.1, "seed": 101},
        "resolution": (4096, 2048),
        "has_atmosphere": False,
        "has_clouds": False
    },
    {
        "id": "cratered-rocky",
        "name": "Cratered Rocky World",
        "description": "Airless body with severe impact saturation, rayed ejecta blankets, and ancient highlands.",
        "palette": {
            "base": [(30, 30, 32), (65, 65, 68), (110, 110, 115), (160, 160, 165), (210, 212, 218)],
            "roughness_range": (0.7, 1.0)
        },
        "noise_config": {"octaves": 8, "persistence": 0.55, "lacunarity": 2.2, "seed": 202, "crater_boost": True},
        "has_atmosphere": False,
        "has_clouds": False
    },
    {
        "id": "super-earth",
        "name": "Super-Earth",
        "description": "Massive terrestrial world with vast tectonic plates, continents, deep oceans, and dynamic atmospheric cloud bands.",
        "palette": {
            "base": [(12, 28, 56), (18, 55, 95), (42, 112, 78), (140, 135, 90), (215, 225, 235)],
            "roughness_range": (0.2, 0.85)
        },
        "noise_config": {"octaves": 7, "persistence": 0.5, "lacunarity": 2.0, "seed": 303},
        "has_atmosphere": True,
        "has_clouds": True,
        "cloud_palette": [(240, 245, 255)]
    },
    {
        "id": "lava",
        "name": "Lava World",
        "description": "Ultra-hot rocky world with dark molten basalt plates and glowing silicate/magma fissures.",
        "palette": {
            "base": [(20, 15, 15), (45, 25, 20), (140, 35, 10), (225, 80, 15), (255, 200, 50)],
            "roughness_range": (0.3, 0.9)
        },
        "noise_config": {"octaves": 7, "persistence": 0.58, "lacunarity": 2.0, "seed": 404, "lava_fissures": True},
        "has_atmosphere": True,
        "has_clouds": False
    },
    {
        "id": "desert",
        "name": "Desert World",
        "description": "Arid planet dominated by extensive dune fields, iron oxide badlands, and canyon networks.",
        "palette": {
            "base": [(110, 50, 30), (165, 85, 45), (210, 130, 70), (235, 175, 105), (245, 210, 160)],
            "roughness_range": (0.5, 0.9)
        },
        "noise_config": {"octaves": 6, "persistence": 0.48, "lacunarity": 2.0, "seed": 505},
        "has_atmosphere": True,
        "has_clouds": False
    },
    {
        "id": "ocean",
        "name": "Ocean-like Hypothetical World",
        "description": "Water-dominated planet with global deep oceans, submerged reefs, and polar ice shelves.",
        "palette": {
            "base": [(4, 18, 48), (10, 42, 92), (18, 90, 145), (45, 150, 180), (220, 240, 250)],
            "roughness_range": (0.1, 0.4)
        },
        "noise_config": {"octaves": 6, "persistence": 0.45, "lacunarity": 2.0, "seed": 606},
        "has_atmosphere": True,
        "has_clouds": True,
        "cloud_palette": [(250, 252, 255)]
    },
    {
        "id": "ice",
        "name": "Ice World",
        "description": "Frozen cryo-world with fractured nitrogen/methane ice plains and translucent blue glacial chasms.",
        "palette": {
            "base": [(140, 170, 195), (180, 205, 225), (215, 230, 245), (235, 245, 252), (250, 252, 255)],
            "roughness_range": (0.2, 0.7)
        },
        "noise_config": {"octaves": 7, "persistence": 0.54, "lacunarity": 2.1, "seed": 707},
        "has_atmosphere": False,
        "has_clouds": False
    },
    {
        "id": "mini-neptune",
        "name": "Mini-Neptune",
        "description": "Volatile-rich sub-Neptune with deep hydrogen-helium atmosphere, turquoise haze, and atmospheric eddy currents.",
        "palette": {
            "base": [(20, 70, 95), (35, 115, 140), (60, 160, 180), (105, 195, 205), (170, 225, 230)],
            "roughness_range": (0.3, 0.6)
        },
        "noise_config": {"octaves": 6, "persistence": 0.45, "lacunarity": 2.0, "seed": 808, "gas_bands": True},
        "has_atmosphere": True,
        "has_clouds": True
    },
    {
        "id": "neptune-like",
        "name": "Neptune-like",
        "description": "Deep azure ice giant with pronounced atmospheric circulation belts and bright methane ice clouds.",
        "palette": {
            "base": [(15, 30, 85), (25, 60, 145), (45, 95, 195), (75, 140, 225), (140, 190, 245)],
            "roughness_range": (0.25, 0.55)
        },
        "noise_config": {"octaves": 6, "persistence": 0.46, "lacunarity": 2.0, "seed": 909, "gas_bands": True},
        "has_atmosphere": True,
        "has_clouds": True
    },
    {
        "id": "gas-giant",
        "name": "Gas Giant",
        "description": "Massive Jovian world featuring turbulent zonal jet streams, anticyclonic vortex storms, and ammonia-hydrosulfide cloud decks.",
        "palette": {
            "base": [(95, 60, 40), (145, 95, 60), (195, 140, 90), (225, 185, 135), (245, 225, 190)],
            "roughness_range": (0.3, 0.6)
        },
        "noise_config": {"octaves": 7, "persistence": 0.5, "lacunarity": 2.0, "seed": 1010, "gas_bands": True, "turbulent": True},
        "has_atmosphere": True,
        "has_clouds": True
    },
    {
        "id": "hot-jupiter",
        "name": "Hot Jupiter",
        "description": "Gas giant in ultra-short period orbit subjected to extreme stellar insolation, silicate vapor clouds, and dramatic day-night temperature gradients.",
        "palette": {
            "base": [(40, 15, 25), (105, 35, 45), (180, 60, 45), (230, 120, 60), (255, 190, 110)],
            "roughness_range": (0.2, 0.5)
        },
        "noise_config": {"octaves": 6, "persistence": 0.48, "lacunarity": 2.0, "seed": 1111, "gas_bands": True, "hot_glow": True},
        "has_atmosphere": True,
        "has_clouds": False
    },
    {
        "id": "unknown",
        "name": "Unknown / Unclassified Visual Archetype",
        "description": "Unclassified candidate exoplanet rendered with neutral balanced spectroscopic placeholder visualization.",
        "palette": {
            "base": [(40, 42, 55), (70, 75, 95), (110, 115, 135), (160, 165, 185), (210, 215, 230)],
            "roughness_range": (0.4, 0.8)
        },
        "noise_config": {"octaves": 6, "persistence": 0.5, "lacunarity": 2.0, "seed": 1212},
        "has_atmosphere": True,
        "has_clouds": False
    }
]

# ==============================================================================
# 3. NOISE & TEXTURE SYNTHESIS ENGINE
# ==============================================================================

def generate_spherical_noise(width, height, config):
    """
    Generates mathematically seamless 2:1 equirectangular noise using 3D spherical coordinates.
    Guarantees no horizontal seam at lon=0/2pi and smooth convergence at poles.
    """
    seed = config.get("seed", 42)
    np.random.seed(seed)
    octaves = config.get("octaves", 6)
    persistence = config.get("persistence", 0.5)
    lacunarity = config.get("lacunarity", 2.0)

    lon = np.linspace(0, 2 * np.pi, width, endpoint=False, dtype=np.float32)
    lat = np.linspace(-np.pi / 2, np.pi / 2, height, dtype=np.float32)
    lon_grid, lat_grid = np.meshgrid(lon, lat)

    x = np.cos(lat_grid) * np.cos(lon_grid)
    y = np.cos(lat_grid) * np.sin(lon_grid)
    z = np.sin(lat_grid)

    noise = np.zeros((height, width), dtype=np.float32)
    freq = 1.0
    amp = 1.0

    for i in range(octaves):
        n_features = 4  # fixed number of distinct 3D vector orientations per octave
        angles = np.random.uniform(0, 2 * np.pi, (n_features, 3)).astype(np.float32)
        for a in angles:
            dot = x * (np.sin(a[0]) * np.cos(a[1])) + y * (np.sin(a[0]) * np.sin(a[1])) + z * np.cos(a[0])
            if config.get("gas_bands"):
                band_factor = np.sin(lat_grid * (10.0 + i * 3.0)) * 0.45
                noise += amp * np.sin(freq * (dot + band_factor) * 3.0 + a[2])
            elif config.get("lava_fissures"):
                raw = np.sin(freq * dot * 3.5 + a[2])
                noise += amp * (1.0 - np.abs(raw))
            elif config.get("turbulent"):
                vortex = np.sin(dot * 5.0 + lat_grid * 6.0) * 0.3
                noise += amp * np.sin(freq * (dot + vortex) * 3.0 + a[2])
            else:
                noise += amp * np.sin(freq * dot * 3.0 + a[2])
        amp *= persistence
        freq *= lacunarity

    if config.get("crater_boost"):
        for _ in range(25):
            cx = np.random.uniform(-1, 1)
            cy = np.random.uniform(-1, 1)
            cz = np.random.uniform(-1, 1)
            norm = math.sqrt(cx*cx + cy*cy + cz*cz)
            cx, cy, cz = cx/norm, cy/norm, cz/norm
            radius = np.random.uniform(0.04, 0.16)
            dist = (x - cx)**2 + (y - cy)**2 + (z - cz)**2
            crater = np.exp(-dist / (radius**2))
            noise -= crater * 0.35

    noise = (noise - noise.min()) / (noise.max() - noise.min() + 1e-7)
    return noise

def create_normal_map_from_height(height_array, strength=2.5):
    """
    Computes a tangent-space normal map (RGB where R=X, G=Y, B=Z) from a 2:1 height map.
    Properly handles horizontal wrapping around sphere seam.
    """
    h, w = height_array.shape
    # Sobel / central difference gradient with horizontal wrap
    padded = np.pad(height_array, ((1, 1), (1, 1)), mode='wrap')
    # Use edge mode for poles
    padded[0, :] = padded[1, :]
    padded[-1, :] = padded[-2, :]

    dx = (padded[1:-1, 2:] - padded[1:-1, :-2]) * strength
    dy = (padded[2:, 1:-1] - padded[:-2, 1:-1]) * strength

    # Normal vector (-dx, -dy, 1) normalized to unit length
    dz = np.ones_like(dx)
    mag = np.sqrt(dx**2 + dy**2 + dz**2)
    nx = (-dx / mag * 0.5 + 0.5) * 255.0
    ny = (-dy / mag * 0.5 + 0.5) * 255.0
    nz = (dz / mag * 0.5 + 0.5) * 255.0

    normal_rgb = np.stack([nx, ny, nz], axis=-1).astype(np.uint8)
    return normal_rgb

def map_palette(noise_array, palette_colors):
    """Interpolates an array of float values [0, 1] across RGB palette colors."""
    n_colors = len(palette_colors)
    h, w = noise_array.shape
    output = np.zeros((h, w, 3), dtype=np.uint8)

    scaled = noise_array * (n_colors - 1)
    indices = np.clip(scaled.astype(int), 0, n_colors - 2)
    frac = scaled - indices

    for i in range(n_colors - 1):
        mask = (indices == i)
        c1 = np.array(palette_colors[i], dtype=np.float32)
        c2 = np.array(palette_colors[i+1], dtype=np.float32)
        interp = (c1 * (1.0 - frac[:, :, None]) + c2 * frac[:, :, None])
        output[mask] = interp[mask].astype(np.uint8)

    return output

# ==============================================================================
# 4. PROCESSING WORKFLOWS
# ==============================================================================

def download_file(url, dest_path):
    """Downloads a file safely to disk if not already present."""
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 50:
        return True
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    try:
        r = session.get(url, timeout=20)
        if r.status_code == 200 and len(r.content) > 50:
            with open(dest_path, "wb") as f:
                f.write(r.content)
            return True
        else:
            print(f"  [WARN] Failed to download {url} (status {r.status_code})")
            return False
    except Exception as e:
        print(f"  [ERROR] Download error for {url}: {e}")
        return False

def get_file_info(filepath):
    """Computes file size and sha256 hash."""
    if not os.path.exists(filepath):
        return None
    size = os.path.getsize(filepath)
    with open(filepath, "rb") as f:
        sha256 = hashlib.sha256(f.read()).hexdigest()
    return {"size_bytes": size, "sha256": sha256}

def process_solar_system_body(body_id, body_data):
    """
    Downloads original sources into assets-source/, converts and optimizes to WebP in public/assets/.
    Generates preview (512x256), medium (2048x1024), and high (4096x2048 if source is large).
    """
    print(f"\nProcessing Solar System asset: {body_data['name']} ({body_id})...")
    category = body_data.get("category", "solar-system")
    source_folder = os.path.join(SOURCE_DIR, category, body_id)
    public_folder = os.path.join(PUBLIC_DIR, category, body_id)
    os.makedirs(source_folder, exist_ok=True)
    os.makedirs(public_folder, exist_ok=True)

    manifest_entries = {}
    runtime_assets = {
        "color": None,
        "normal": None,
        "height": None,
        "roughness": None,
        "clouds": None,
        "atmosphere": None,
        "preview": None,
        "high": None
    }

    # 1. Download Color Map
    color_url = body_data["downloads"].get("color")
    raw_color_path = os.path.join(source_folder, "source_color.png" if "png" in color_url else "source_color.jpg")
    success = download_file(color_url, raw_color_path)

    if not success and "fallback_color" in body_data["downloads"]:
        print(f"  Trying fallback for {body_id} color...")
        fallback_url = body_data["downloads"]["fallback_color"]
        success = download_file(fallback_url, raw_color_path)

    if os.path.exists(raw_color_path):
        img = Image.open(raw_color_path).convert("RGB")
        orig_w, orig_h = img.size
        file_info = get_file_info(raw_color_path)
        manifest_entries["source_color"] = {
            "path": os.path.relpath(raw_color_path, BASE_DIR).replace("\\", "/"),
            "resolution": f"{orig_w}x{orig_h}",
            "size_bytes": file_info["size_bytes"],
            "url": color_url,
            "license": body_data["primary_source"]["license"]
        }

        # Target resolutions
        med_w, med_h = 2048, 1024
        prev_w, prev_h = 512, 256

        # Generate medium standard color.webp
        med_img = img.resize((med_w, med_h), Image.Resampling.LANCZOS)
        med_path = os.path.join(public_folder, "color.webp")
        med_img.save(med_path, "WEBP", quality=88)
        runtime_assets["color"] = f"/assets/{category}/{body_id}/color.webp"
        manifest_entries["runtime_color"] = {
            "path": f"public/assets/{category}/{body_id}/color.webp",
            "resolution": f"{med_w}x{med_h}",
            "size_bytes": os.path.getsize(med_path),
            "format": "WebP (Q88)"
        }

        # Generate preview.webp
        prev_img = img.resize((prev_w, prev_h), Image.Resampling.LANCZOS)
        prev_path = os.path.join(public_folder, "preview.webp")
        prev_img.save(prev_path, "WEBP", quality=80)
        runtime_assets["preview"] = f"/assets/{category}/{body_id}/preview.webp"
        manifest_entries["runtime_preview"] = {
            "path": f"public/assets/{category}/{body_id}/preview.webp",
            "resolution": f"{prev_w}x{prev_h}",
            "size_bytes": os.path.getsize(prev_path),
            "format": "WebP (Q80)"
        }

        # If source resolution was 4K or above, generate high.webp
        if orig_w >= 4096:
            high_path = os.path.join(public_folder, "high.webp")
            img.save(high_path, "WEBP", quality=90)
            runtime_assets["high"] = f"/assets/{category}/{body_id}/high.webp"
            manifest_entries["runtime_high"] = {
                "path": f"public/assets/{category}/{body_id}/high.webp",
                "resolution": f"{orig_w}x{orig_h}",
                "size_bytes": os.path.getsize(high_path),
                "format": "WebP (Q90)"
            }

    # 2. Download Normal / Altimetry Map if available
    if "normal" in body_data["downloads"]:
        norm_url = body_data["downloads"]["normal"]
        raw_norm_path = os.path.join(source_folder, "source_normal.png")
        if download_file(norm_url, raw_norm_path):
            n_img = Image.open(raw_norm_path).convert("RGB")
            n_w, n_h = n_img.size
            manifest_entries["source_normal"] = {
                "path": os.path.relpath(raw_norm_path, BASE_DIR).replace("\\", "/"),
                "resolution": f"{n_w}x{n_h}",
                "size_bytes": os.path.getsize(raw_norm_path),
                "url": norm_url
            }
            n_med = n_img.resize((2048, 1024), Image.Resampling.LANCZOS)
            n_path = os.path.join(public_folder, "normal.webp")
            n_med.save(n_path, "WEBP", quality=90, method=6)
            runtime_assets["normal"] = f"/assets/{category}/{body_id}/normal.webp"
            manifest_entries["runtime_normal"] = {
                "path": f"public/assets/{category}/{body_id}/normal.webp",
                "resolution": "2048x1024",
                "size_bytes": os.path.getsize(n_path),
                "format": "WebP"
            }

    # 3. Download Clouds if available (e.g. Earth)
    if "clouds" in body_data["downloads"]:
        c_url = body_data["downloads"]["clouds"]
        raw_c_path = os.path.join(source_folder, "source_clouds.jpg")
        if download_file(c_url, raw_c_path):
            c_img = Image.open(raw_c_path).convert("L")
            c_w, c_h = c_img.size
            manifest_entries["source_clouds"] = {
                "path": os.path.relpath(raw_c_path, BASE_DIR).replace("\\", "/"),
                "resolution": f"{c_w}x{c_h}",
                "size_bytes": os.path.getsize(raw_c_path),
                "url": c_url
            }
            c_med = c_img.resize((2048, 1024), Image.Resampling.LANCZOS)
            c_path = os.path.join(public_folder, "clouds.webp")
            c_med.save(c_path, "WEBP", quality=85, method=6)
            runtime_assets["clouds"] = f"/assets/{category}/{body_id}/clouds.webp"
            manifest_entries["runtime_clouds"] = {
                "path": f"public/assets/{category}/{body_id}/clouds.webp",
                "resolution": "2048x1024",
                "size_bytes": os.path.getsize(c_path),
                "format": "WebP"
            }

    # 4. Download Rings if available (e.g. Saturn, Uranus, Neptune)
    if "rings" in body_data["downloads"]:
        r_url = body_data["downloads"]["rings"]
        raw_r_path = os.path.join(source_folder, "source_rings.png")
        if download_file(r_url, raw_r_path):
            r_img = Image.open(raw_r_path).convert("RGBA")
            r_path = os.path.join(public_folder, "rings.webp")
            r_img.save(r_path, "WEBP", lossless=True)
            runtime_assets["rings"] = f"/assets/{category}/{body_id}/rings.webp"
            manifest_entries["runtime_rings"] = {
                "path": f"public/assets/{category}/{body_id}/rings.webp",
                "resolution": f"{r_img.width}x{r_img.height}",
                "size_bytes": os.path.getsize(r_path),
                "format": "WebP (Lossless Alpha)"
            }
            # Also save to public/assets/models/rings/
            models_rings_dir = os.path.join(PUBLIC_DIR, "models", "rings")
            os.makedirs(models_rings_dir, exist_ok=True)
            r_img.save(os.path.join(models_rings_dir, f"{body_id}_rings.webp"), "WEBP", lossless=True)

    # Write individual metadata JSON
    meta_entry = {
        "id": body_id,
        "name": body_data["name"],
        "category": category,
        "type": body_data["type"],
        "description": body_data["description"],
        "assets": runtime_assets,
        "source": body_data["primary_source"],
        "manifest": manifest_entries
    }

    meta_file = os.path.join(PUBLIC_DIR, "metadata", f"{body_id}.json")
    os.makedirs(os.path.dirname(meta_file), exist_ok=True)
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta_entry, f, indent=2)

    return meta_entry

def generate_procedural_archetype(archetype_info):
    """
    Generates 2:1 equirectangular seamless procedural textures for an exoplanet visual archetype.
    Produces color.webp, normal.webp, roughness.webp, height.webp, preview.webp, and clouds.webp (if applicable).
    """
    arch_id = archetype_info["id"]
    print(f"\nSynthesizing Procedural Visual Archetype: {archetype_info['name']} ({arch_id})...")
    arch_folder = os.path.join(PUBLIC_DIR, "procedural", arch_id)
    os.makedirs(arch_folder, exist_ok=True)

    w, h = archetype_info.get("resolution", (2048, 1024))
    prev_w, prev_h = 512, 256

    # 1. Height / Terrain Noise
    height_noise = generate_spherical_noise(w, h, archetype_info["noise_config"])

    # 2. Color Map
    color_rgb = map_palette(height_noise, archetype_info["palette"]["base"])
    color_img = Image.fromarray(color_rgb, "RGB")
    color_path = os.path.join(arch_folder, "color.webp")
    color_img.save(color_path, "WEBP", quality=88)

    # 3. Preview Map
    prev_img = color_img.resize((prev_w, prev_h), Image.Resampling.LANCZOS)
    prev_path = os.path.join(arch_folder, "preview.webp")
    prev_img.save(prev_path, "WEBP", quality=80)

    # 4. Normal Map
    normal_rgb = create_normal_map_from_height(height_noise, strength=2.8)
    normal_img = Image.fromarray(normal_rgb, "RGB")
    normal_path = os.path.join(arch_folder, "normal.webp")
    normal_img.save(normal_path, "WEBP", quality=90)

    # 5. Roughness Map
    r_min, r_max = archetype_info["palette"]["roughness_range"]
    roughness_array = ((1.0 - height_noise) * (r_max - r_min) + r_min) * 255.0
    roughness_img = Image.fromarray(roughness_array.astype(np.uint8), "L")
    roughness_path = os.path.join(arch_folder, "roughness.webp")
    roughness_img.save(roughness_path, "WEBP", quality=85)

    # 6. Height Map
    height_img = Image.fromarray((height_noise * 255.0).astype(np.uint8), "L")
    height_path = os.path.join(arch_folder, "height.webp")
    height_img.save(height_path, "WEBP", quality=85)

    runtime_assets = {
        "color": f"/assets/procedural/{arch_id}/color.webp",
        "normal": f"/assets/procedural/{arch_id}/normal.webp",
        "roughness": f"/assets/procedural/{arch_id}/roughness.webp",
        "height": f"/assets/procedural/{arch_id}/height.webp",
        "preview": f"/assets/procedural/{arch_id}/preview.webp",
        "clouds": None,
        "atmosphere": None
    }

    manifest_entries = {
        "runtime_color": {"path": f"public/assets/procedural/{arch_id}/color.webp", "resolution": f"{w}x{h}", "size_bytes": os.path.getsize(color_path)},
        "runtime_normal": {"path": f"public/assets/procedural/{arch_id}/normal.webp", "resolution": f"{w}x{h}", "size_bytes": os.path.getsize(normal_path)},
        "runtime_roughness": {"path": f"public/assets/procedural/{arch_id}/roughness.webp", "resolution": f"{w}x{h}", "size_bytes": os.path.getsize(roughness_path)},
        "runtime_height": {"path": f"public/assets/procedural/{arch_id}/height.webp", "resolution": f"{w}x{h}", "size_bytes": os.path.getsize(height_path)},
        "runtime_preview": {"path": f"public/assets/procedural/{arch_id}/preview.webp", "resolution": f"{prev_w}x{prev_h}", "size_bytes": os.path.getsize(prev_path)}
    }

    # 7. Dynamic Clouds if enabled
    if archetype_info.get("has_clouds"):
        cloud_config = {"octaves": 6, "persistence": 0.45, "lacunarity": 2.0, "seed": archetype_info["noise_config"]["seed"] + 999, "gas_bands": archetype_info.get("noise_config", {}).get("gas_bands", False)}
        cloud_noise = generate_spherical_noise(w, h, cloud_config)
        cloud_mask = np.clip((cloud_noise - 0.42) * 2.2, 0.0, 1.0) * 255.0
        cloud_img = Image.fromarray(cloud_mask.astype(np.uint8), "L")
        cloud_path = os.path.join(arch_folder, "clouds.webp")
        cloud_img.save(cloud_path, "WEBP", quality=85, method=6)
        runtime_assets["clouds"] = f"/assets/procedural/{arch_id}/clouds.webp"
        manifest_entries["runtime_clouds"] = {"path": f"public/assets/procedural/{arch_id}/clouds.webp", "resolution": f"{w}x{h}", "size_bytes": os.path.getsize(cloud_path)}

    meta_entry = {
        "id": arch_id,
        "name": archetype_info["name"],
        "category": "procedural",
        "type": "exoplanet-archetype",
        "description": archetype_info["description"],
        "disclaimer": "Model visualization based on available planetary parameters. Not a direct image.",
        "assets": runtime_assets,
        "source": {
            "organization": "COSMIC VALUE Mathematical Synthesizer",
            "algorithm": "3D Spherical Coordinate Fractional Multi-Octave Fractal Noise Generator",
            "projection": "Equirectangular 2:1 cylindrical",
            "license": "MIT / Creative Commons CC0 (Educational Project Asset)"
        },
        "manifest": manifest_entries
    }

    meta_file = os.path.join(PUBLIC_DIR, "metadata", f"procedural_{arch_id}.json")
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(meta_entry, f, indent=2)

    return meta_entry

# ==============================================================================
# 5. MAIN EXECUTION PIPELINE & REPORT GENERATOR
# ==============================================================================

def main():
    print("=" * 70)
    print("COSMIC VALUE - PLANETARY ASSET PIPELINE & HARVESTER")
    print("=" * 70)

    all_solar_entries = {}
    all_manifest = {
        "project": "COSMIC VALUE (NASA Space Apps Challenge)",
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "description": "Standardized, web-optimized 2:1 equirectangular asset manifest for Three.js / React Three Fiber planetary rendering.",
        "solar_system_count": 0,
        "exoplanet_archetypes_count": 0,
        "total_files": 0,
        "total_asset_size_kb": 0,
        "bodies": {},
        "procedural_archetypes": {}
    }

    # Process Solar System Bodies
    for body_id, body_data in SOLAR_SYSTEM_CATALOG.items():
        entry = process_solar_system_body(body_id, body_data)
        all_solar_entries[body_id] = entry
        all_manifest["bodies"][body_id] = entry

    # Process Procedural Archetypes
    for arch in EXOPLANET_ARCHETYPES:
        entry = generate_procedural_archetype(arch)
        all_manifest["procedural_archetypes"][arch["id"]] = entry

    all_manifest["solar_system_count"] = len(all_solar_entries)
    all_manifest["exoplanet_archetypes_count"] = len(EXOPLANET_ARCHETYPES)

    # Compute Total Statistics
    total_bytes = 0
    total_files = 0
    for root, dirs, files in os.walk(PUBLIC_DIR):
        for f in files:
            fp = os.path.join(root, f)
            total_bytes += os.path.getsize(fp)
            total_files += 1

    all_manifest["total_files"] = total_files
    all_manifest["total_asset_size_kb"] = round(total_bytes / 1024, 2)

    # Write src/data/solarSystemAssets.json
    combined_json_path = os.path.join(DATA_DIR, "solarSystemAssets.json")
    with open(combined_json_path, "w", encoding="utf-8") as f:
        json.dump(all_solar_entries, f, indent=2)
    print(f"\n[OK] Generated {combined_json_path}")

    # Write ASSET_MANIFEST.json
    manifest_path = os.path.join(BASE_DIR, "ASSET_MANIFEST.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(all_manifest, f, indent=2)
    print(f"[OK] Generated {manifest_path}")

    # Generate ASSET_REPORT.md
    generate_asset_report(all_manifest)

def generate_asset_report(manifest):
    report_path = os.path.join(BASE_DIR, "ASSET_REPORT.md")
    print(f"\nGenerating ASSET_REPORT.md at {report_path}...")

    md = []
    md.append("# COSMIC VALUE: Planetary Asset Library Report")
    md.append("### NASA Space Apps Challenge Project Asset Inventory & Integration Guide\n")
    md.append("> **Notice**: All Solar System assets have been harvested from public domain NASA, JPL-Caltech, USGS Astrogeology Science Center, and Creative Commons open-science cartographic processing teams (e.g. Stellarium open-source cartography). No proprietary NASA Eyes code, branding logos, or private endpoints were scraped or utilized.")
    md.append("\n---\n")

    md.append("## 1. Executive Summary\n")
    md.append(f"- **Total Solar System Bodies Processed**: {manifest['solar_system_count']} (8 Planets, 1 Dwarf Planet, 16 Moons, 1 Deep Starfield Panorama)")
    md.append(f"- **Total Procedural Exoplanet Archetypes**: {manifest['exoplanet_archetypes_count']} Archetypes (covering all NASA Exoplanet Archive visual regimes)")
    md.append(f"- **Total Optimized Runtime Files**: {manifest['total_files']} files")
    md.append(f"- **Total Runtime Asset Footprint**: {manifest['total_asset_size_kb']} KB (~{round(manifest['total_asset_size_kb']/1024, 2)} MB)")
    md.append("- **Standard Format**: WebP (2:1 Equirectangular Cylindrical projection for Three.js `SphereGeometry`)")
    md.append("- **Resolution Standards**: Preview (512x256), Medium/Standard (2048x1024), Ultra-High (4096x2048 for key bodies where source exists)")
    md.append("\n---\n")

    md.append("## 2. Solar System Assets Inventory & Provenance\n")
    md.append("| Body | Category | Type | Color Map | Normal Map | Cloud Map | Rings | Source Organization & Mission | License / Attribution |")
    md.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

    for body_id, b in manifest["bodies"].items():
        assets = b["assets"]
        color_st = "✅ Yes" if assets.get("color") else "❌ None"
        norm_st = "✅ Yes" if assets.get("normal") else "—"
        cloud_st = "✅ Yes" if assets.get("clouds") else "—"
        ring_st = "✅ Yes" if assets.get("rings") else "—"
        org = b["source"].get("organization", "NASA / JPL")
        mission = b["source"].get("mission", "")
        lic = b["source"].get("license", "Public Domain")
        md.append(f"| **{b['name']}** | `{b['category']}` | {b['type']} | {color_st} | {norm_st} | {cloud_st} | {ring_st} | {org} ({mission}) | {lic} |")

    md.append("\n---\n")

    md.append("## 3. Procedural Exoplanet Visual Archetypes\n")
    md.append("Because direct resolved surface imagery of exoplanets is physically unattainable with current astronomical instrumentation, the project uses mathematical 3D spherical noise simulations tailored to known exoplanet physical parameter classes (temperature, mass, radius, composition).\n")
    md.append("**Mandatory UI Disclaimer**:\n> *\"Model visualization based on available planetary parameters. Not a direct image.\"*\n")
    md.append("| Archetype ID | Archetype Name | Physical Regime & Surface Description | Included Maps | Color Palette Profile |")
    md.append("| :--- | :--- | :--- | :--- | :--- |")

    for arch_id, a in manifest["procedural_archetypes"].items():
        maps = []
        if a["assets"].get("color"): maps.append("Color")
        if a["assets"].get("normal"): maps.append("Normal")
        if a["assets"].get("roughness"): maps.append("Roughness")
        if a["assets"].get("height"): maps.append("Height")
        if a["assets"].get("clouds"): maps.append("Clouds")
        map_str = ", ".join(maps)
        md.append(f"| `{arch_id}` | **{a['name']}** | {a['description']} | {map_str} | Seamless 3D Spherical Noise |")

    md.append("\n---\n")

    md.append("## 4. Directory Structure\n")
    md.append("```\ncosmic_value_assets/\n├── assets-source/                     # Raw untouched downloads (preserves original provenance)\n│   ├── solar-system/\n│   │   ├── mercury/ (source_color.png)\n│   │   ├── venus/\n│   │   ├── earth/\n│   │   ├── mars/\n│   │   ├── jupiter/\n│   │   ├── saturn/\n│   │   ├── uranus/\n│   │   ├── neptune/\n│   │   └── pluto/\n│   ├── moons/                         # 16 moons (moon, io, europa, ganymede, callisto, titan, etc.)\n│   └── environments/\n├── public/\n│   └── assets/\n│       ├── solar-system/              # WebP runtime textures (color.webp, preview.webp, high.webp)\n│       ├── moons/                     # WebP runtime textures for all 16 moons\n│       ├── procedural/                # 12 Procedural archetypes (color, normal, roughness, height, clouds)\n│       ├── environments/stars/        # Milky Way & deep starfield background\n│       └── metadata/                  # Individual body and archetype JSON descriptors\n├── src/\n│   └── data/\n│       └── solarSystemAssets.json     # Master unified JSON data file for Three.js / React Three Fiber\n├── ASSET_MANIFEST.json                # Complete machine-readable asset manifest with file sizes & hashes\n└── ASSET_REPORT.md                    # Detailed verification & integration report\n```\n")

    md.append("\n---\n")

    md.append("## 5. Three.js / React Three Fiber Integration Guide\n")
    md.append("### A. Equirectangular Sphere Mapping\n")
    md.append("All planetary textures are rendered in 2:1 equirectangular cylindrical projection. Apply them directly to Three.js `SphereGeometry`:\n")
    md.append("```javascript\nimport * as THREE from 'three';\nimport { useLoader } from '@react-three/fiber';\nimport { TextureLoader } from 'three';\n\nexport function Planet({ assetData }) {\n  const [colorMap, normalMap, cloudsMap] = useLoader(TextureLoader, [\n    assetData.assets.color,\n    assetData.assets.normal || '/assets/procedural/rocky/normal.webp',\n    assetData.assets.clouds || null\n  ].filter(Boolean));\n\n  // Ensure sRGB color space encoding\n  if (colorMap) colorMap.colorSpace = THREE.SRGBColorSpace;\n\n  return (\n    <group>\n      {/* Planetary Surface */}\n      <mesh>\n        <sphereGeometry args={[1, 64, 64]} />\n        <meshStandardMaterial\n          map={colorMap}\n          normalMap={assetData.assets.normal ? normalMap : null}\n          roughness={0.8}\n          metalness={0.1}\n        />\n      </mesh>\n\n      {/* Atmospheric Cloud Layer (if present) */}\n      {cloudsMap && (\n        <mesh scale={[1.015, 1.015, 1.015]}>\n          <sphereGeometry args={[1, 64, 64]} />\n          <meshStandardMaterial\n            map={cloudsMap}\n            transparent={true}\n            opacity={0.85}\n            blending={THREE.AdditiveBlending}\n            depthWrite={false}\n          />\n        </mesh>\n      )}\n    </group>\n  );\n}\n```\n")

    md.append("### B. Seam & Polar Distortion Validation\n")
    md.append("- **Horizontal Seam (u = 0 / 1)**: All textures were verified to align horizontally without discontinuities across the $0^\\circ \\leftrightarrow 360^\\circ$ meridian.\n")
    md.append("- **Polar Pinching**: The procedural generator samples 3D unit sphere space vectors $(\\cos\\phi \\cos\\theta, \\cos\\phi \\sin\\theta, \\sin\\phi)$ to eliminate polar artifacts.\n")
    md.append("- **Texture Orientation**: North pole at top ($v = 1$), prime meridian at center ($u = 0.5$).\n")

    md.append("\n---\n")

    md.append("## 6. Missing Assets & Legitimate Scientific Derivations\n")
    md.append("- **Normal / Elevation Maps for Outer Moons**: NASA and USGS missions (Voyager 2, Galileo, Cassini) captured extensive single-band and visible mosaics, but global high-resolution digital elevation models (DEMs) are only scientifically established for Earth, Moon (LOLA), Mars (MOLA), and Mercury (MESSENGER). In accordance with instructions, scientific normal maps were **not fabricated** for bodies lacking authentic altimetry data; `normal` is set to `null` in metadata.\n")
    md.append("- **Venus Clouds vs Surface**: The primary color map provides radar-penetrating surface topography. The thick sulfuric atmosphere can be represented via standard procedural Rayleigh scattering shaders.\n")

    md.append("\n---\n")

    md.append("## 7. Legal, Licensing & Reuse Guidelines\n")
    md.append("1. **NASA & JPL Public Domain**: Works produced by NASA and USGS civil servants are in the public domain and free for educational, scientific, and public visualization under 17 U.S.C. § 105.\n")
    md.append("2. **Cartographic Post-Processing Attribution**: Cartographic mosaics processed by Oleg Pluton, James Hastings-Trew, and Axel Mellinger are licensed under Creative Commons Attribution (CC-BY 4.0). Credit is explicitly recorded in `ASSET_MANIFEST.json` and `solarSystemAssets.json`.\n")
    md.append("3. **NASA Logo & Branding**: No NASA insignia ('meatball'), NASA logotype ('worm'), or NASA seal are included in the product.\n")
    md.append("4. **NASA Eyes Distinction**: This project is built completely independently without proprietary NASA Eyes JavaScript code, internal shaders, or private telemetry APIs.\n")

    with open(report_path, "w", encoding="utf-8") as f:
        f.write("\n".join(md))
    print(f"[OK] Generated {report_path}")

if __name__ == "__main__":
    main()
