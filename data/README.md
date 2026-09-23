# NASA Exoplanet Archive Dataset Snapshot

This repository contains the NASA Exoplanet Archive Planetary Systems composite data snapshot used to drive the searchable 3D exoplanet explorer.

## Snapshot Provenance

- **Source Archive**: [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) (Caltech / IPAC / NASA)
- **Table Name**: Planetary Systems (`ps`)
- **Snapshot Date**: September 20, 2026 (10:52:04 UTC)
- **Filename**: `data/raw/PS_2026.09.20_10.52.04.csv`
- **Total Rows in Raw Snapshot**: 40,237 lines (40,155 data rows + 82 header/metadata comment lines)
- **Authoritative Planet Count**: Exactly 6,366 unique planets flagged with `default_flag = 1`
- **License**: Public Domain / NASA Open Data Policy

## How the Catalog is Built

The raw CSV is converted into an optimized, lightweight JSON payload suitable for browser streaming:

```bash
npm run import:catalog
```

Or via direct node invocation:
```bash
node scripts/import_exoplanet_catalog.js
```

### Path Resolution Priority

The import script (`scripts/import_exoplanet_catalog.js`) resolves the source CSV using the following priority:
1. Command line argument: `node scripts/import_exoplanet_catalog.js <path-to-csv>`
2. Environment variable: `EXOPLANET_CSV_PATH`
3. Repository local file: `data/raw/PS_2026.09.20_10.52.04.csv`
4. Sibling workspace path: `../cosmic-value/data/raw/PS_2026.09.20_10.52.04.csv`

The generated JSON file is written to:
`public/data/exoplanet_catalog.json` (~9.98 MB, 6,366 validated exoplanet entries with complete orbital, physical, stellar, and bibliographic provenance).

## Obtaining Future or Fresh Snapshots

To obtain a new snapshot directly from the NASA Exoplanet Archive TAP API:

```bash
curl -o data/raw/PS_latest.csv "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=select+*+from+ps&format=csv"
npm run import:catalog -- data/raw/PS_latest.csv
```

Alternatively, visit the [NASA Exoplanet Archive Table Access Protocol](https://exoplanetarchive.ipac.caltech.edu/docs/TAP/using_TAP.html) or the Planetary Systems Interactive Table and export all columns as CSV.
