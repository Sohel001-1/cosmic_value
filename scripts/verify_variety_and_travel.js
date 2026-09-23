import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  determineVisualFamily,
  computeHostSystemCoordinates,
  computeVisualScale,
  hashString
} from '../src/utils/exoplanetAdapter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/data/exoplanet_catalog.json'), 'utf8'));

const targets = ['2MASS J03590986+2009361 b', '11 Com b', '4 UMa b', '51 Eri b', 'TRAPPIST-1 e', 'TOI-700 d', 'Mercury'];

console.log('=== VERIFYING TARGET PLANETS & FLIGHT VECTORS ===\n');

for (const name of targets) {
  if (name === 'Mercury') {
    console.log(`[Mercury]`);
    console.log(`  Family: Terrestrial Silicate (Observed MESSENGER 8K)`);
    console.log(`  World Position: [0, 0, 0]`);
    console.log(`  Host: Sun (Sol)\n`);
    continue;
  }
  const p = catalog.planets.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (p) {
    const familyInfo = determineVisualFamily(p);
    const coords = computeHostSystemCoordinates(p.hostname);
    const scale = computeVisualScale(p);
    console.log(`[${p.name}]`);
    console.log(`  Host System: ${p.hostname} (Coords: [${coords.join(', ')}])`);
    console.log(`  Visual Family: ${familyInfo.family}`);
    console.log(`  Type Label: ${familyInfo.typeLabel}`);
    console.log(`  Visual Radius: ${scale.visualRadius} units`);
    console.log(`  Mass: ${p.massEarths.value ?? 'UNKNOWN'} M⊕ [${p.massEarths.provenance ?? 'None'}]`);
    console.log(`  Radius: ${p.radiusEarths.value ?? 'UNKNOWN'} R⊕`);
    console.log(`  T_eq: ${p.equilibriumTempK.value ?? 'UNKNOWN'} K`);
    console.log(`  Discovery: ${p.discoveryMethod} (${p.discoveryYear})\n`);
  }
}
