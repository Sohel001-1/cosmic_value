import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSourceCsvPath() {
  if (process.argv[2] && fs.existsSync(process.argv[2])) {
    return path.resolve(process.argv[2]);
  }
  if (process.env.EXOPLANET_CSV_PATH && fs.existsSync(process.env.EXOPLANET_CSV_PATH)) {
    return path.resolve(process.env.EXOPLANET_CSV_PATH);
  }
  const repoLocalPath = path.resolve(__dirname, '../data/raw/PS_2026.09.20_10.52.04.csv');
  if (fs.existsSync(repoLocalPath)) {
    return repoLocalPath;
  }
  const siblingPath = path.resolve(__dirname, '../../cosmic-value/data/raw/PS_2026.09.20_10.52.04.csv');
  if (fs.existsSync(siblingPath)) {
    return siblingPath;
  }
  const legacyDefault = 'C:\\projects\\cosmic-value\\data\\raw\\PS_2026.09.20_10.52.04.csv';
  if (fs.existsSync(legacyDefault)) {
    return legacyDefault;
  }
  return repoLocalPath;
}

const OUTPUT_DIR = path.resolve(__dirname, '../public/data');
const OUTPUT_JSON = path.join(OUTPUT_DIR, 'exoplanet_catalog.json');

function decodeHtmlEntities(text) {
  if (!text) return text;
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&uuml;/g, 'ü')
    .replace(/&ouml;/g, 'ö')
    .replace(/&auml;/g, 'ä')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Auml;/g, 'Ä');
}

// Helper to parse reference string formatted as HTML: <a refstr=... href=... target=ref>Text</a>
function parseReference(rawRef) {
  if (!rawRef || rawRef.trim() === '') return null;
  const str = rawRef.trim();
  const hrefMatch = str.match(/href=([^\s>]+)/i);
  const textMatch = str.match(/>([^<]+)<\/a>/i);
  const refstrMatch = str.match(/refstr=([^\s>]+)/i);

  const url = hrefMatch ? hrefMatch[1].replace(/["']/g, '') : null;
  const rawLabel = textMatch ? textMatch[1].trim() : (refstrMatch ? refstrMatch[1] : str);
  return {
    label: decodeHtmlEntities(rawLabel),
    url: url,
    rawKey: refstrMatch ? refstrMatch[1] : null
  };
}

// Parse floating point or null
function parseNum(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  const n = Number(val.trim());
  return isNaN(n) ? null : n;
}

// Parse integer or null
function parseIntNum(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? null : n;
}

// Parse string or null
function parseStr(val) {
  if (val === undefined || val === null || val.trim() === '') return null;
  return val.trim();
}

// RFC 4180 CSV line parser handling quotes and commas
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function runImport() {
  const csvPath = getSourceCsvPath();
  console.log(`[Catalog Import] Reading source: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(
      `Source CSV file not found.\n` +
      `Targeted path: ${csvPath}\n\n` +
      `To obtain the snapshot:\n` +
      `  1. Download NASA Exoplanet Archive Planetary Systems Composite snapshot (PS_2026.09.20_10.52.04.csv)\n` +
      `     from https://exoplanetarchive.ipac.caltech.edu\n` +
      `  2. Place it in: ${path.resolve(__dirname, '../data/raw/PS_2026.09.20_10.52.04.csv')}\n` +
      `     or provide its path via command argument: npm run import:catalog -- <path-to-csv>\n` +
      `     or set environment variable EXOPLANET_CSV_PATH`
    );
  }

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let header = null;
  let headerColMap = {};
  const metadataComments = [];
  const defaultRows = [];
  const planetNameSet = new Set();
  const defaultNameSet = new Set();

  let lineIndex = 0;
  for await (const line of rl) {
    lineIndex++;
    if (line.startsWith('#')) {
      if (line.startsWith('# Date:') || line.startsWith('# Description:') || line.startsWith('# COLUMN')) {
        metadataComments.push(line.replace(/^#\s*/, ''));
      }
      continue;
    }

    if (!header) {
      header = parseCsvLine(line);
      header.forEach((col, idx) => {
        headerColMap[col.trim()] = idx;
      });
      console.log(`[Catalog Import] Header parsed: ${header.length} columns.`);
      continue;
    }

    const cols = parseCsvLine(line);
    const pl_name = cols[headerColMap['pl_name']];
    const default_flag = cols[headerColMap['default_flag']];

    if (!pl_name) continue;
    planetNameSet.add(pl_name);

    if (default_flag === '1') {
      if (defaultNameSet.has(pl_name)) {
        throw new Error(`Validation Error: Duplicate default row found for planet '${pl_name}' at line ${lineIndex}`);
      }
      defaultNameSet.add(pl_name);

      const entry = {
        name: parseStr(cols[headerColMap['pl_name']]),
        hostname: parseStr(cols[headerColMap['hostname']]),
        numStars: parseIntNum(cols[headerColMap['sy_snum']]),
        numPlanets: parseIntNum(cols[headerColMap['sy_pnum']]),
        isCircumbinary: cols[headerColMap['cb_flag']] === '1',
        discoveryMethod: parseStr(cols[headerColMap['discoverymethod']]),
        discoveryYear: parseIntNum(cols[headerColMap['disc_year']]),
        discoveryFacility: parseStr(cols[headerColMap['disc_facility']]),
        discoveryTelescope: parseStr(cols[headerColMap['disc_telescope']]),
        isControversial: cols[headerColMap['pl_controv_flag']] === '1',
        planetReference: parseReference(cols[headerColMap['pl_refname']]),
        
        // Orbital Period [days]
        orbitalPeriodDays: {
          value: parseNum(cols[headerColMap['pl_orbper']]),
          err1: parseNum(cols[headerColMap['pl_orbpererr1']]),
          err2: parseNum(cols[headerColMap['pl_orbpererr2']]),
          lim: parseIntNum(cols[headerColMap['pl_orbperlim']]),
        },
        
        // Semi-Major Axis [au]
        semiMajorAxisAu: {
          value: parseNum(cols[headerColMap['pl_orbsmax']]),
          err1: parseNum(cols[headerColMap['pl_orbsmaxerr1']]),
          err2: parseNum(cols[headerColMap['pl_orbsmaxerr2']]),
          lim: parseIntNum(cols[headerColMap['pl_orbsmaxlim']]),
        },
        
        // Planet Radius [Earth Radii]
        radiusEarths: {
          value: parseNum(cols[headerColMap['pl_rade']]),
          err1: parseNum(cols[headerColMap['pl_radeerr1']]),
          err2: parseNum(cols[headerColMap['pl_radeerr2']]),
          lim: parseIntNum(cols[headerColMap['pl_radelim']]),
        },

        // Planet Mass [Earth Masses]
        massEarths: {
          value: parseNum(cols[headerColMap['pl_bmasse']]),
          err1: parseNum(cols[headerColMap['pl_bmasseerr1']]),
          err2: parseNum(cols[headerColMap['pl_bmasseerr2']]),
          lim: parseIntNum(cols[headerColMap['pl_bmasselim']]),
          provenance: parseStr(cols[headerColMap['pl_bmassprov']]), // 'Mass', 'Msini', 'Mass-Radius'
        },

        // Bulk Density [g/cm^3]
        densityGcm3: {
          value: parseNum(cols[headerColMap['pl_dens']]),
          err1: parseNum(cols[headerColMap['pl_denserr1']]),
          err2: parseNum(cols[headerColMap['pl_denserr2']]),
          lim: parseIntNum(cols[headerColMap['pl_denslim']]),
        },

        // Orbital Eccentricity
        eccentricity: {
          value: parseNum(cols[headerColMap['pl_orbeccen']]),
          err1: parseNum(cols[headerColMap['pl_orbeccenerr1']]),
          err2: parseNum(cols[headerColMap['pl_orbeccenerr2']]),
          lim: parseIntNum(cols[headerColMap['pl_orbeccenlim']]),
        },

        // Insolation Flux [Earth Flux]
        insolationFluxEarths: {
          value: parseNum(cols[headerColMap['pl_insol']]),
          err1: parseNum(cols[headerColMap['pl_insolerr1']]),
          err2: parseNum(cols[headerColMap['pl_insolerr2']]),
          lim: parseIntNum(cols[headerColMap['pl_insollim']]),
        },

        // Equilibrium Temperature [K]
        equilibriumTempK: {
          value: parseNum(cols[headerColMap['pl_eqt']]),
          err1: parseNum(cols[headerColMap['pl_eqterr1']]),
          err2: parseNum(cols[headerColMap['pl_eqterr2']]),
          lim: parseIntNum(cols[headerColMap['pl_eqtlim']]),
        },

        // Stellar host parameters
        stellar: {
          reference: parseReference(cols[headerColMap['st_refname']]),
          spectralType: parseStr(cols[headerColMap['st_spectype']]),
          teffK: {
            value: parseNum(cols[headerColMap['st_teff']]),
            err1: parseNum(cols[headerColMap['st_tefferr1']]),
            err2: parseNum(cols[headerColMap['st_tefferr2']]),
            lim: parseIntNum(cols[headerColMap['st_tefflim']]),
          },
          radiusSolar: {
            value: parseNum(cols[headerColMap['st_rad']]),
            err1: parseNum(cols[headerColMap['st_raderr1']]),
            err2: parseNum(cols[headerColMap['st_raderr2']]),
            lim: parseIntNum(cols[headerColMap['st_radlim']]),
          },
          massSolar: {
            value: parseNum(cols[headerColMap['st_mass']]),
            err1: parseNum(cols[headerColMap['st_masserr1']]),
            err2: parseNum(cols[headerColMap['st_masserr2']]),
            lim: parseIntNum(cols[headerColMap['st_masslim']]),
          },
          metallicityDex: {
            value: parseNum(cols[headerColMap['st_met']]),
            err1: parseNum(cols[headerColMap['st_meterr1']]),
            err2: parseNum(cols[headerColMap['st_meterr2']]),
            lim: parseIntNum(cols[headerColMap['st_metlim']]),
          },
          luminosityLogSolar: {
            value: parseNum(cols[headerColMap['st_lum']]),
            err1: parseNum(cols[headerColMap['st_lumerr1']]),
            err2: parseNum(cols[headerColMap['st_lumerr2']]),
            lim: parseIntNum(cols[headerColMap['st_lumlim']]),
          },
        },

        // System distance [pc]
        distancePc: {
          value: parseNum(cols[headerColMap['sy_dist']]),
          err1: parseNum(cols[headerColMap['sy_disterr1']]),
          err2: parseNum(cols[headerColMap['sy_disterr2']]),
        },

        rowUpdate: parseStr(cols[headerColMap['rowupdate']]),
        publicationDate: parseStr(cols[headerColMap['pl_pubdate']]),
        numSpectra: {
          eclipse: parseIntNum(cols[headerColMap['pl_nespec']]) || 0,
          transmission: parseIntNum(cols[headerColMap['pl_ntranspec']]) || 0,
          directImaging: parseIntNum(cols[headerColMap['pl_ndispec']]) || 0,
        },
      };

      defaultRows.push(entry);
    }
  }

  console.log(`[Catalog Import] Total lines scanned: ${lineIndex}`);
  console.log(`[Catalog Import] Unique planets in dataset: ${planetNameSet.size}`);
  console.log(`[Catalog Import] Default rows extracted (default_flag=1): ${defaultRows.length}`);

  // Strict Validation Assertion
  if (planetNameSet.size !== 6366) {
    throw new Error(`Validation Error: Expected exactly 6,366 unique planets, but found ${planetNameSet.size}`);
  }
  if (defaultRows.length !== 6366) {
    throw new Error(`Validation Error: Expected exactly 6,366 default rows, but extracted ${defaultRows.length}`);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const catalogPayload = {
    metadata: {
      snapshotFile: 'PS_2026.09.20_10.52.04.csv',
      snapshotDate: '2026-09-20 10:52:04',
      importedAt: new Date().toISOString(),
      sourceArchive: 'NASA Exoplanet Archive (Planetary Systems Composite / PS Table)',
      totalPlanets: defaultRows.length,
      license: 'Public Domain / NASA Data Policy',
      querySummary: 'default_flag=1; one authoritative measurement set per validated planet.',
    },
    planets: defaultRows,
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(catalogPayload));
  const fileSizeMb = (fs.statSync(OUTPUT_JSON).size / (1024 * 1024)).toFixed(2);
  console.log(`[Catalog Import] Successfully generated: ${OUTPUT_JSON} (${fileSizeMb} MB)`);
}

runImport().catch((err) => {
  console.error(`[Catalog Import] FAILED:`, err);
  process.exit(1);
});
