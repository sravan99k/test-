import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'src/components/assessments');
const grades = [6, 7, 8, 9, 10];
const phases = [1, 2, 3, 4];

console.log('=== ASSESSMENT ARCHITECTURE AUDIT ===\n');

grades.forEach(grade => {
    console.log(`\n### GRADE ${grade} ###`);

    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);

        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));

            console.log(`\n  Phase ${phase}:`);

            files.forEach(file => {
                const filePath = path.join(phaseDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                const type = file.includes('major') ? 'MAJOR' : 'MINI';
                const domains = data.metadata?.domainsCovered || [];
                const questions = data.questions?.length || 0;
                const name = data.metadata?.assessmentName || 'N/A';

                console.log(`    ${type}: ${name} (${questions}q) - Domains: ${domains.join(', ')}`);
            });

        } catch (e) {
            console.log(`    [No assessments found]`);
        }
    });
});

console.log('\n\n=== DOMAIN COVERAGE ANALYSIS ===\n');

grades.forEach(grade => {
    console.log(`\nGrade ${grade} Domain Coverage:`);

    const allDomains = new Set();
    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);
        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const data = JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                (data.metadata?.domainsCovered || []).forEach(d => allDomains.add(d));
            });
        } catch (e) { }
    });

    console.log(`  Total unique domains: ${allDomains.size}`);
    console.log(`  Domains: ${Array.from(allDomains).join(', ')}`);
});
