import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const catalogPath = path.resolve(__dirname, '../public/data/exoplanet_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('=== NASA EXOPLANET CATALOG VALIDATION ===');
console.log('Total catalog entries:', catalog.planets.length);
console.log('Snapshot file:', catalog.metadata.snapshotFile);
console.log('Snapshot date:', catalog.metadata.snapshotDate);
console.log('Archive:', catalog.metadata.sourceArchive);

let htmlTagsInRefs = 0;
let massProvenances = new Set();
let discoveryMethods = new Set();
let missingRadiusCount = 0;
let missingMassCount = 0;
let missingTeqCount = 0;
let missingDistanceCount = 0;

for (const p of catalog.planets) {
  if (p.planetReference?.label?.includes('<') || p.planetReference?.url?.includes('<')) {
    htmlTagsInRefs++;
  }
  if (p.stellar?.reference?.label?.includes('<') || p.stellar?.reference?.url?.includes('<')) {
    htmlTagsInRefs++;
  }
  if (p.massEarths?.provenance) massProvenances.add(p.massEarths.provenance);
  if (p.discoveryMethod) discoveryMethods.add(p.discoveryMethod);

  if (p.radiusEarths.value === null) missingRadiusCount++;
  if (p.massEarths.value === null) missingMassCount++;
  if (p.equilibriumTempK.value === null) missingTeqCount++;
  if (p.distancePc.value === null) missingDistanceCount++;
}

console.log('Validation checks:');
console.log(`- Exact 6,366 count: ${catalog.planets.length === 6366 ? 'PASS (6,366)' : 'FAIL'}`);
console.log(`- HTML tags in references: ${htmlTagsInRefs === 0 ? 'PASS (0 tags)' : 'FAIL (' + htmlTagsInRefs + ')'}`);
console.log(`- Mass Provenances found:`, Array.from(massProvenances));
console.log(`- Unique Discovery Methods (${discoveryMethods.size}):`, Array.from(discoveryMethods));
console.log(`- Missing field statistics:`);
console.log(`  * Missing radius: ${missingRadiusCount} planets (${(missingRadiusCount/63.66).toFixed(1)}%)`);
console.log(`  * Missing mass: ${missingMassCount} planets (${(missingMassCount/63.66).toFixed(1)}%)`);
console.log(`  * Missing Teq: ${missingTeqCount} planets (${(missingTeqCount/63.66).toFixed(1)}%)`);
console.log(`  * Missing distance: ${missingDistanceCount} planets (${(missingDistanceCount/63.66).toFixed(1)}%)`);

// Sample targets
const testTargets = ['TRAPPIST-1 e', 'Kepler-452 b', '51 Peg b', 'TOI-700 d', 'Proxima Cen b', 'WASP-121 b'];
console.log('\nSample Verified Targets:');
for (const targetName of testTargets) {
  const p = catalog.planets.find(x => x.name === targetName);
  if (p) {
    console.log(`- [${p.name}] Host: ${p.hostname} | Method: ${p.discoveryMethod} (${p.discoveryYear}) | Radius: ${p.radiusEarths.value ?? 'UNKNOWN'} R⊕ | Mass: ${p.massEarths.value ?? 'UNKNOWN'} M⊕ [${p.massEarths.provenance ?? 'None'}] | Dist: ${p.distancePc.value ?? 'UNKNOWN'} pc | Ref: ${p.planetReference?.label}`);
  } else {
    console.log(`- [${targetName}] NOT FOUND`);
  }
}
