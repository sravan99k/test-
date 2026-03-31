import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '..', '..', 'assessments');
const grades = [6, 7, 8, 9, 10];
const phases = [1, 2, 3, 4];

const report = {
    totalFilesExpected: 50,
    filesFound: 0,
    errors: [],
    anchorItems: {},
    criticalQuestions: []
};

async function validate() {
    console.log('--- Starting Assessment Validation ---');

    for (const grade of grades) {
        for (const phase of phases) {
            const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);

            // Check Major
            const majorPath = path.join(phaseDir, 'major.json');
            validateFile(majorPath, grade, phase, 'Major');

            // Check Minis
            if (phase < 4) {
                const mini1Path = path.join(phaseDir, `mini-${phase}-1.json`);
                const mini2Path = path.join(phaseDir, `mini-${phase}-2.json`);
                validateFile(mini1Path, grade, phase, 'Mini 1');
                validateFile(mini2Path, grade, phase, 'Mini 2');
            }
        }
    }

    console.log('\n--- Validation Result ---');
    console.log(`Files Found: ${report.filesFound} / ${report.totalFilesExpected}`);

    if (report.errors.length > 0) {
        console.error(`Errors Found (${report.errors.length}):`);
        report.errors.forEach(err => console.error(`- ${err}`));
    } else {
        console.log('✅ All files are present and valid JSON!');
    }

    // Anchor Check Summary
    console.log('\n--- Anchor Item Coverage ---');
    Object.keys(report.anchorItems).sort().forEach(anchorId => {
        console.log(`${anchorId}: Present in ${report.anchorItems[anchorId]} assessments`);
    });

    console.log('\n--- Critical Questions Found ---');
    console.log(`Total Critical: ${report.criticalQuestions.length}`);
}

function validateFile(filePath, grade, phase, type) {
    if (!fs.existsSync(filePath)) {
        report.errors.push(`Missing file: Grade ${grade} Phase ${phase} ${type} (${filePath})`);
        return;
    }

    report.filesFound++;
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);

        // Check Questions
        const questions = data.questions || (data.scenarios ? data.scenarios.flatMap(s => s.questions) : []);

        questions.forEach(q => {
            if (q.isAnchor && q.anchorId) {
                report.anchorItems[q.anchorId] = (report.anchorItems[q.anchorId] || 0) + 1;
            }
            if (q.isCritical || q.autoRedFlag) {
                report.criticalQuestions.push({
                    grade, phase, id: q.id, text: q.question
                });
            }
        });

    } catch (e) {
        report.errors.push(`JSON Error in Grade ${grade} Phase ${phase} ${type}: ${e.message}`);
    }
}

validate();
