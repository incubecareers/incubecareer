import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'scripts/update-logo-refs.mjs']
});

let totalReplacements = 0;

files.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8');
    const newContent = content.replace(/\/logo-full\.png/g, '/logo.png');
    
    if (content !== newContent) {
      writeFileSync(file, newContent, 'utf8');
      const count = (content.match(/\/logo-full\.png/g) || []).length;
      console.log(`✓ Updated ${file} (${count} replacement${count > 1 ? 's' : ''})`);
      totalReplacements += count;
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\nTotal: ${totalReplacements} replacement${totalReplacements !== 1 ? 's' : ''} across ${files.length} files`);
