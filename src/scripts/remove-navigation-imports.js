import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pagesDir = join(__dirname, '../../src/pages');

// Files to process
const filesToProcess = [
  'WellnessDashboard.tsx',
  'StudentDashboard.tsx',
  'SchoolSettings.tsx',
  'SchoolDashboard.tsx',
  'Resources.tsx',
  'ReportsPage.tsx',
  'ProgressTracking.tsx',
  'ProfileSettings.tsx',
  'MyAssessments.tsx',
  'Index.tsx',
  'CognitiveTasks.tsx',
  'ChatPage.tsx',
  'BuddySafe.tsx',
  'Assessment.tsx',
  'AnalyticsPage.tsx',
  'alerts/index.tsx',
];

// Process each file
filesToProcess.forEach(file => {
  const filePath = join(pagesDir, file);
  
  if (existsSync(filePath)) {
    let content = readFileSync(filePath, 'utf8');
    
    // Remove Navigation import
    content = content.replace(/import\s+Navigation\s+from\s+["']@\/components\/Navigation["'];?\n?/g, '');
    
    // Remove Navigation component usage
    content = content.replace(/<Navigation\s*\/?>\s*<\/Navigation>\n?/g, '');
    content = content.replace(/<Navigation\s*\/?\/>\n?/g, '');
    
    // Save the file
    writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${file}`);
  } else {
    console.log(`Skipped (not found): ${file}`);
  }
});

console.log('Navigation cleanup complete!');
