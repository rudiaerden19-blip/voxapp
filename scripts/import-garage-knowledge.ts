// Script om garage kennis te importeren
// Run: npx ts-node scripts/import-garage-knowledge.ts

import * as fs from 'fs';
import * as path from 'path';

interface GarageRequest {
  id: number;
  category: string;
  brand: string;
  part: string;
  action: string;
  question: string;
}

interface TransformedItem {
  category: string;
  title: string;
  content: string;
}

// Read the JSON file
const filePath = process.argv[2] || '/Users/rudiaerden/Downloads/garage_requests_150000_full_realistic.json';
const rawData = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(rawData);

// Get the requests array
const requests: GarageRequest[] = data.requests || data;

console.log(`Found ${requests.length} items to transform`);

// Transform to our format
const transformed: TransformedItem[] = requests.map((r) => ({
  category: r.category || 'algemeen',
  title: `${r.brand} ${r.part} ${r.action}`.trim(),
  content: r.question,
}));

// Split into chunks of 1000 for easier importing
const CHUNK_SIZE = 1000;
const outputDir = path.join(__dirname, '../data/garage-chunks');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (let i = 0; i < transformed.length; i += CHUNK_SIZE) {
  const chunk = transformed.slice(i, i + CHUNK_SIZE);
  const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
  const outputPath = path.join(outputDir, `garage-chunk-${chunkNumber.toString().padStart(3, '0')}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(chunk, null, 2));
  console.log(`Written chunk ${chunkNumber}: ${chunk.length} items`);
}

console.log(`\nDone! Created ${Math.ceil(transformed.length / CHUNK_SIZE)} chunk files in ${outputDir}`);
console.log('\nYou can now import each chunk via the admin panel or use the API.');
