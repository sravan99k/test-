#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Define all renames to perform
const renames = [
  { old: 'admin dashbaord', new: 'admin-dashboard', dir: 'src/components' },
  { old: 'domians and questions', new: 'domains-and-questions', dir: 'src/components' },
  { old: 'ui components', new: 'ui-components', dir: 'src/components' },
  { old: 'assessment components', new: 'assessment-components', dir: 'src/components/student-dashboard' },
  { old: 'authentication & forms', new: 'authentication-forms', dir: 'src/components/student-dashboard' },
  { old: 'dashbard & layout components', new: 'dashboard-layout-components', dir: 'src/components/student-dashboard' },
  { old: 'safety & education components', new: 'safety-education-components', dir: 'src/components/student-dashboard' },
  { old: 'utility components', new: 'utility-components', dir: 'src/components/student-dashboard' },
  { old: 'authentication hooks', new: 'authentication-hooks', dir: 'src/hooks' },
  { old: 'features hooks', new: 'features-hooks', dir: 'src/hooks' },
  { old: 'utility hooks', new: 'utility-hooks', dir: 'src/hooks' },
  { old: 'assessment services', new: 'assessment-services', dir: 'src/services' },
  { old: 'authentication & admin', new: 'authentication-admin', dir: 'src/services' },
  { old: 'chatbot analysis', new: 'chatbot-analysis', dir: 'src/services' },
  { old: 'data services', new: 'data-services', dir: 'src/services' },
  { old: 'resources management', new: 'resources-management', dir: 'src/services' },
  { old: 'risk & flagging system', new: 'risk-flagging-system', dir: 'src/services' },
  { old: 'test configuration', new: 'test-configuration', dir: 'src/test' },
];

// Import mapping replacements
const importReplacements = [
  { pattern: /admin dashbaord/g, replacement: 'admin-dashboard' },
  { pattern: /domians and questions/g, replacement: 'domains-and-questions' },
  { pattern: /ui components/g, replacement: 'ui-components' },
  { pattern: /assessment components/g, replacement: 'assessment-components' },
  { pattern: /authentication & forms/g, replacement: 'authentication-forms' },
  { pattern: /dashbard & layout components/g, replacement: 'dashboard-layout-components' },
  { pattern: /safety & education components/g, replacement: 'safety-education-components' },
  { pattern: /utility components/g, replacement: 'utility-components' },
  { pattern: /authentication hooks/g, replacement: 'authentication-hooks' },
  { pattern: /features hooks/g, replacement: 'features-hooks' },
  { pattern: /utility hooks/g, replacement: 'utility-hooks' },
  { pattern: /assessment services/g, replacement: 'assessment-services' },
  { pattern: /authentication & admin/g, replacement: 'authentication-admin' },
  { pattern: /chatbot analysis/g, replacement: 'chatbot-analysis' },
  { pattern: /data services/g, replacement: 'data-services' },
  { pattern: /resources management/g, replacement: 'resources-management' },
  { pattern: /risk & flagging system/g, replacement: 'risk-flagging-system' },
  { pattern: /test configuration/g, replacement: 'test-configuration' },
  { pattern: /advanced components/g, replacement: 'advanced-components' },
  { pattern: /data display components/g, replacement: 'data-display-components' },
  { pattern: /feedback & notification components/g, replacement: 'feedback-notification-components' },
  { pattern: /form & input components/g, replacement: 'form-input-components' },
  { pattern: /layout & container components/g, replacement: 'layout-container-components' },
];

function walkDir(dir, callback) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git', '.vscode', '.next'].includes(item)) {
        walkDir(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  });
}

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    importReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

console.log('🔧 Starting directory rename & import fix ...\n');

// Fix imports first (before renaming)
console.log('📝 Fixing imports in source files...');
let fixedCount = 0;
const srcDir = path.join(projectRoot, 'src');
walkDir(srcDir, (filePath) => {
  if (['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(path.extname(filePath))) {
    if (fixImportsInFile(filePath)) {
      fixedCount++;
    }
  }
});
console.log(`✅ Fixed ${fixedCount} file(s)\n`);

// Now rename directories using shell commands  
console.log('📁 Renaming directories...');
let renamedCount = 0;

renames.forEach(({ old, new: newName, dir }) => {
  const fullOldPath = path.join(projectRoot, dir, old);
  const fullNewPath = path.join(projectRoot, dir, newName);
  
  if (fs.existsSync(fullOldPath)) {
    try {
      // Use PowerShell Move-Item for cross-platform compatibility
      execSync(`powershell -Command "Move-Item -LiteralPath '${fullOldPath}' -Destination '${fullNewPath}' -Force"`, { 
        stdio: 'pipe',
        shell: 'powershell'
      });
      console.log(`✓ ${path.join(dir, old)}`);
      renamedCount++;
    } catch (err) {
      console.log(`✗ Failed: ${path.join(dir, old)}`);
    }
  }
});

console.log(`\n✅ Renamed ${renamedCount} director${renamedCount === 1 ? 'y' : 'ies'}\n`);
console.log('Next: npm run build');
