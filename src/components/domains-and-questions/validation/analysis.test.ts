import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Types based on the schema inference
interface AssessmentMetadata {
  grade?: number;
  phase?: number;
  assessmentCode?: string;
  assessmentId?: string;
  assessmentName?: string;
  purpose?: string;
  timing?: string;
  estimatedTimeMinutes?: number;
  totalQuestions?: number;
  domainsCovered?: string[];
}

interface ResponseOptions {
  type?: string;
  scale?: string[];
  values?: (number | null)[];
  options?: string[];
}

interface Question {
  id: string;
  questionNumber: number;
  section?: string;
  domain?: string;
  question: string;
  responseType: string;
  responseOptions: ResponseOptions;
  flagConditions?: Record<string, any>;
  isCritical?: boolean;
  autoRedFlag?: boolean;
}

interface Assessment {
  metadata: AssessmentMetadata;
  questions: Question[];
}

describe('Assessment Analysis', () => {
  const rootDir = path.resolve(__dirname, '../');
  const files: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const questionIds = new Set<string>();
  const assessmentIds = new Set<string>();

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      // Skip validation folder itself to avoid recursion if we put this file there
      if (entry === 'validation') continue;
      
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }

  it('analyzes all assessment JSON files', () => {
    console.log('Starting Assessment Analysis...');
    scanDir(rootDir);
    console.log(`Found ${files.length} JSON files.`);

    let totalQuestions = 0;

    for (const file of files) {
        const relativePath = path.relative(rootDir, file);
        try {
            const content = fs.readFileSync(file, 'utf-8');
            const data = JSON.parse(content) as Assessment;

            // 1. Structure Check
            if (!data.metadata || !data.questions) {
                errors.push(`${relativePath}: Missing metadata or questions object.`);
                continue;
            }

            // 2. Metadata Check
            if (!data.metadata.assessmentId) {
                errors.push(`${relativePath}: Missing assessmentId in metadata.`);
            } else {
                if (assessmentIds.has(data.metadata.assessmentId)) {
                    errors.push(`${relativePath}: Duplicate assessmentId '${data.metadata.assessmentId}'.`);
                }
                assessmentIds.add(data.metadata.assessmentId);
            }

            if (!data.metadata.grade) warnings.push(`${relativePath}: Missing grade in metadata.`);
            if (!data.metadata.phase) warnings.push(`${relativePath}: Missing phase in metadata.`);

            // 3. Questions Check
            if (!Array.isArray(data.questions)) {
                errors.push(`${relativePath}: 'questions' is not an array.`);
                continue;
            }

            totalQuestions += data.questions.length;

            data.questions.forEach((q, idx) => {
                const qRef = `${relativePath} Q#${q.questionNumber || idx + 1}`;

                if (!q.id) {
                    errors.push(`${qRef}: Missing question ID.`);
                } else {
                    if (questionIds.has(q.id)) {
                        errors.push(`${qRef}: Duplicate question ID '${q.id}'.`);
                    }
                    questionIds.add(q.id);
                }

                if (!q.question) errors.push(`${qRef}: Missing question text.`);
                if (!q.responseType) errors.push(`${qRef}: Missing responseType.`);
                if (!q.responseOptions) {
                    errors.push(`${qRef}: Missing responseOptions.`);
                } else {
                    // Quick check on response options consistency
                    if (q.responseType !== 'text' && (!q.responseOptions.options && !q.responseOptions.scale)) {
                        errors.push(`${qRef}: responseOptions missing 'options' or 'scale' for type ${q.responseType}.`);
                    }
                    if (q.responseOptions.values && q.responseOptions.options && q.responseOptions.values.length !== q.responseOptions.options.length) {
                         errors.push(`${qRef}: Mismatch between options count and values count.`);
                    }
                     if (q.responseOptions.values && q.responseOptions.scale && q.responseOptions.values.length !== q.responseOptions.scale.length) {
                         errors.push(`${qRef}: Mismatch between scale count and values count.`);
                    }
                }
            });

        } catch (e: any) {
            errors.push(`${relativePath}: Failed to parse JSON or invalid structure. ${e.message}`);
        }
    }

    console.log('\n--- Analysis Report ---');
    console.log(`Total Files Scanned: ${files.length}`);
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Unique Assessment IDs: ${assessmentIds.size}`);
    console.log(`Unique Question IDs: ${questionIds.size}`);
    
    if (errors.length > 0) {
        console.error('\nErrors Found:');
        errors.forEach(e => console.error(`[ERROR] ${e}`));
    } else {
        console.log('\nNo errors found.');
    }

    if (warnings.length > 0) {
        console.warn('\nWarnings:');
        warnings.forEach(w => console.warn(`[WARN] ${w}`));
    } else {
        console.log('\nNo warnings found.');
    }

    // Fail the test if there are errors so we know
    expect(errors.length).toBe(0);
  });
});
