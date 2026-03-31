#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');

// Mapping of incorrect imports to correct ones
const importMappings = [
  // Old folder names with spaces
  {
    pattern: /from\s+['"]\.\/.*?\/cognitive games\/(['"])/g,
    replacement: (match, quote) => match.replace('cognitive games', 'cognitive-games')
  },
  {
    pattern: /from\s+['"]\.\.\/.*?\/cognitive games\/(['"])/g,
    replacement: (match, quote) => match.replace('cognitive games', 'cognitive-games')
  },
  {
    pattern: /from\s+['"]@\/.*?\/cognitive games\/(['"])/g,
    replacement: (match, quote) => match.replace('cognitive games', 'cognitive-games')
  },
  // Fix common relative path patterns
  {
    pattern: /from\s+['"]\.\/student\/pages\/cognitive\s+games\//g,
    replacement: "from './student/pages/cognitive-games/"
  },
  {
    pattern: /from\s+['"]\.\.\/student\/pages\/cognitive\s+games\//g,
    replacement: "from '../student/pages/cognitive-games/"
  },
  //  Image path fixes
  {
    pattern: /imageUrl:\s+['"]https:\/\/images\.unsplash\.com\//g,
    replacement: "imageUrl: '/Resource Images/"
  }
];

function walkDir(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, .git, etc.
      if (!['node_modules', 'dist', '.git', '.vscode'].includes(item)) {
        files.push(...walkDir(fullPath));
      }
    } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
      files.push(fullPath);
    }
  });

  return files;
}

function fixFileImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Apply each mapping
    importMappings.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });

    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ Fixed: ${path.relative(projectRoot, filePath)}`);
      return true;
    }

    return false;
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
    return false;
  }
}

console.log('🔧 Starting import path fixes...\n');

const files = walkDir(srcDir);
let fixed = 0;

console.log(`📁 Found ${files.length} source files\n`);

files.forEach((file) => {
  if (fixFileImports(file)) {
    fixed++;
  }
});

console.log(`\n✅ Complete! Fixed ${fixed} file(s)\n`);
console.log('Next steps:');
console.log('1. Run: npm run build');
console.log('2. Check for any remaining import errors');
console.log('3. Verify images load from /public/Resource Images/');
