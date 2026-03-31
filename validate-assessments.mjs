import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'src/components/assessments');
const manifestPath = path.join(baseDir, 'assessmentManifest.json');

console.log('=== FINAL VALIDATION FOR PRODUCTION ===\n');

// Load manifest
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let errors = 0;
let warnings = 0;

console.log('1. VALIDATING MANIFEST REFERENCES...');
Object.keys(manifest.assessments).forEach(grade => {
    manifest.assessments[grade].forEach(assessment => {
        const filePath = path.join(baseDir, assessment.file);
        if (!fs.existsSync(filePath)) {
            console.log(`   ❌ ERROR: Missing file ${assessment.file}`);
            errors++;
        }
    });
});
console.log(`   ✅ Manifest validation complete (${errors} errors)\n`);

console.log('2. VALIDATING JSON SYNTAX...');
const grades = [6, 7, 8, 9, 10];
const phases = [1, 2, 3, 4];
grades.forEach(grade => {
    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);
        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                try {
                    JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                } catch (e) {
                    console.log(`   ❌ ERROR: Invalid JSON in grade-${grade}/phase-${phase}/${file}`);
                    errors++;
                }
            });
        } catch (e) { }
    });
});
console.log(`   ✅ JSON syntax validation complete (${errors} errors)\n`);

console.log('3. VALIDATING DOMAIN STANDARDIZATION...');
const standardDomains = ['Emotional', 'Academic', 'Social', 'Safety', 'Support', 'Family', 'Identity', 'Resilience'];
grades.forEach(grade => {
    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);
        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const data = JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                const domains = data.metadata?.domainsCovered || [];
                domains.forEach(domain => {
                    if (!standardDomains.includes(domain)) {
                        console.log(`   ⚠️  WARNING: Non-standard domain "${domain}" in grade-${grade}/phase-${phase}/${file}`);
                        warnings++;
                    }
                });
            });
        } catch (e) { }
    });
});
console.log(`   ✅ Domain validation complete (${warnings} warnings)\n`);

console.log('4. VALIDATING VALUE SCALES...');
grades.forEach(grade => {
    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);
        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const data = JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                data.questions?.forEach((q, idx) => {
                    const values = q.responseOptions?.values;
                    if (values) {
                        // Check for old 1-5 scale
                        if (JSON.stringify(values) === '[1,2,3,4,5]') {
                            console.log(`   ❌ ERROR: Old 1-5 scale found in grade-${grade}/phase-${phase}/${file} Q${idx + 1}`);
                            errors++;
                        }
                        // Check for 5-point using 0-4
                        if (values.length === 5 && JSON.stringify(values) !== '[0,1,2,3,4]') {
                            console.log(`   ⚠️  WARNING: Non-standard 5-point scale in grade-${grade}/phase-${phase}/${file} Q${idx + 1}`);
                            warnings++;
                        }
                        // Check for 3-point using 0-2-4
                        if (values.length === 3 && JSON.stringify(values) !== '[0,2,4]') {
                            console.log(`   ⚠️  WARNING: Non-standard 3-point scale in grade-${grade}/phase-${phase}/${file} Q${idx + 1}`);
                            warnings++;
                        }
                    }
                });
            });
        } catch (e) { }
    });
});
console.log(`   ✅ Value scale validation complete\n`);

console.log('5. CHECKING FOR SCENARIO ARRAYS...');
let scenarioArrays = 0;
grades.forEach(grade => {
    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);
        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const data = JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                if (data.scenarios && Array.isArray(data.scenarios)) {
                    console.log(`   ⚠️  WARNING: Scenario array found in grade-${grade}/phase-${phase}/${file}`);
                    scenarioArrays++;
                    warnings++;
                }
            });
        } catch (e) { }
    });
});
console.log(`   ✅ Scenario structure check complete (${scenarioArrays} found)\n`);

console.log('\n=== FINAL RESULTS ===');
console.log(`❌ ERRORS: ${errors}`);
console.log(`⚠️  WARNINGS: ${warnings}`);

if (errors === 0 && warnings === 0) {
    console.log('\n🎉 PRODUCTION READY! All validations passed.');
} else if (errors === 0) {
    console.log('\n✅ PRODUCTION READY with minor warnings.');
} else {
    console.log('\n❌ NOT PRODUCTION READY. Fix errors before deployment.');
}
