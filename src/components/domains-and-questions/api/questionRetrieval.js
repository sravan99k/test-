/**
 * Assessment Question Retrieval API
 * Provides functions to dynamically load questions based on grade, phase, and student flags
 */

const fs = require('fs').promises;
const path = require('path');

const ASSESSMENTS_DIR = path.join(__dirname, '..');

/**
 * Fetch all questions for a specific grade (all phases)
 * @param {number} grade - Grade level (6-10)
 * @returns {Promise<Object>} All assessment data for the grade
 */
async function getQuestionsByGrade(grade) {
  if (grade < 6 || grade > 10) {
    throw new Error('Grade must be between 6 and 10');
  }

  const gradeDir = path.join(ASSESSMENTS_DIR, `grade-${grade}`);
  const allQuestions = {
    grade,
    phases: []
  };

  // Load all 4 phases
  for (let phase = 1; phase <= 4; phase++) {
    const phaseData = await getQuestionsByGradeAndPhase(grade, phase);
    allQuestions.phases.push(phaseData);
  }

  return allQuestions;
}

/**
 * Fetch all questions for a specific phase across all grades
 * @param {number} phase - Phase number (1-4)
 * @returns {Promise<Array>} Questions from all grades for that phase
 */
async function getQuestionsByPhase(phase) {
  if (phase < 1 || phase > 4) {
    throw new Error('Phase must be between 1 and 4');
  }

  const allGrades = [];
  
  for (let grade = 6; grade <= 10; grade++) {
    try {
      const data = await getQuestionsByGradeAndPhase(grade, phase);
      allGrades.push(data);
    } catch (error) {
      console.warn(`No data for Grade ${grade}, Phase ${phase}: ${error.message}`);
    }
  }

  return allGrades;
}

/**
 * PRIMARY FUNCTION: Fetch questions for a specific grade and phase
 * This is the main function used to run phase exams
 * @param {number} grade - Grade level (6-10)
 * @param {number} phase - Phase number (1-4)
 * @returns {Promise<Object>} All assessment data for that grade/phase
 */
async function getQuestionsByGradeAndPhase(grade, phase) {
  if (grade < 6 || grade > 10) {
    throw new Error('Grade must be between 6 and 10');
  }
  if (phase < 1 || phase > 4) {
    throw new Error('Phase must be between 1 and 4');
  }

  const phaseDir = path.join(ASSESSMENTS_DIR, `grade-${grade}`, `phase-${phase}`);
  
  try {
    const files = await fs.readdir(phaseDir);
    const assessmentData = {
      grade,
      phase,
      major: null,
      minis: []
    };

    // Load all JSON files in the phase directory
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(phaseDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        if (file === 'major.json') {
          assessmentData.major = data;
        } else if (file.startsWith('mini-')) {
          assessmentData.minis.push(data);
        }
      }
    }

    return assessmentData;
  } catch (error) {
    throw new Error(`Failed to load Grade ${grade}, Phase ${phase}: ${error.message}`);
  }
}

/**
 * Fetch only the Major assessment for a grade and phase
 * @param {number} grade - Grade level (6-10)
 * @param {number} phase - Phase number (1-4)
 * @returns {Promise<Object>} Major assessment data
 */
async function getMajorAssessment(grade, phase) {
  const filePath = path.join(ASSESSMENTS_DIR, `grade-${grade}`, `phase-${phase}`, 'major.json');
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load Major assessment for Grade ${grade}, Phase ${phase}: ${error.message}`);
  }
}

// Map adaptive mini scenario IDs to student flag keys for filtering
const SCENARIO_FLAG_MAP = Object.freeze({
  'academic_anxiety': 'academicAnxiety',
  'academic_anxiety_recheck': 'academicAnxiety',
  'social_isolation': 'socialIsolation',
  'social_isolation_recheck': 'socialIsolation',
  'neurodevelopmental_concerns': 'neurodevelopmentalConcerns',
  'trauma_exposure': 'traumaExposure',
  'mood_concerns_recheck': 'moodConcerns',
  'bullying_recheck': 'bullying',
  'no_flags': 'noFlags',
});

/**
 * Fetch adaptive Mini assessment questions based on student flags
 * @param {number} grade - Grade level (6-10)
 * @param {number} phase - Phase number (1-4)
 * @param {number} miniNum - Mini assessment number (1 or 2)
 * @param {Object} studentFlags - Object with flag keys (e.g., {academicAnxiety: true, socialIsolation: false})
 * @returns {Promise<Object>} Filtered questions based on student flags
 */
async function getAdaptiveMiniQuestions(grade, phase, miniNum, studentFlags = {}) {
  const miniFile = `mini-${phase}-${miniNum}.json`;
  const filePath = path.join(ASSESSMENTS_DIR, `grade-${grade}`, `phase-${phase}`, miniFile);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const miniData = JSON.parse(content);

    if (!miniData.metadata.isAdaptive) {
      // Non-adaptive Mini, return all questions
      return miniData;
    }

    const flagValues = Object.values(studentFlags);
    const hasAnyFlag = flagValues.some(Boolean);

    // Filter scenarios based on student flags
    const activeScenarios = miniData.scenarios.filter(scenario => {
      const scenarioId = scenario.scenarioId;
      const flagKey = SCENARIO_FLAG_MAP[scenarioId];
      
      // Special case: "no_flags" scenario only if NO flags are set
      if (scenario.scenarioId === 'no_flags') {

        return Object.values(studentFlags).every(flag => !flag);

      }

      return flagKey && studentFlags[flagKey] === true;
    });

    return {
      ...miniData,
      scenarios: activeScenarios,
      filteredBy: Object.keys(studentFlags).filter(key => studentFlags[key])
    };

  } catch (error) {
    throw new Error(`Failed to load Mini ${miniNum} for Grade ${grade}, Phase ${phase}: ${error.message}`);
  }
}

/**
 * Fetch all anchor items across all Major assessments for a grade
 * @param {number} grade - Grade level (6-10)
 * @returns {Promise<Array>} All anchor questions
 */
async function getAnchorItems(grade) {
  const anchors = [];
  
  for (let phase = 1; phase <= 4; phase++) {
    try {
      const major = await getMajorAssessment(grade, phase);
      const anchorQuestions = major.questions.filter(q => q.isAnchor);
      
      anchorQuestions.forEach(q => {
        // Avoid duplicates (same anchorId across phases)
        if (!anchors.find(a => a.anchorId === q.anchorId)) {
          anchors.push({
            anchorId: q.anchorId,
            question: q.question,
            domain: q.domain,
            appearsIn: [`M${phase}`]
          });
        } else {
          // Add this phase to the existing anchor's appearances
          const existing = anchors.find(a => a.anchorId === q.anchorId);
          existing.appearsIn.push(`M${phase}`);
        }
      });

      // Also check protective factors if present
      if (major.protectiveFactors) {
        major.protectiveFactors
          .filter(pf => pf.isAnchor)
          .forEach(pf => {
            if (!anchors.find(a => a.anchorId === pf.anchorId)) {
              anchors.push({
                anchorId: pf.anchorId,
                question: pf.question,
                domain: pf.domain,
                appearsIn: [`M${phase}`]
              });
            } else {
              const existing = anchors.find(a => a.anchorId === pf.anchorId);
              if (!existing.appearsIn.includes(`M${phase}`)) {
                existing.appearsIn.push(`M${phase}`);
              }
            }
          });
      }

    } catch (error) {
      console.warn(`Could not load Phase ${phase} for anchor extraction: ${error.message}`);
    }
  }

  return anchors;
}

/**
 * Fetch all critical/auto-red flag questions for a grade and phase
 * @param {number} grade - Grade level (6-10)
 * @param {number} phase - Phase number (1-4)
 * @returns {Promise<Array>} Critical questions
 */
async function getCriticalQuestions(grade, phase) {
  try {
    const major = await getMajorAssessment(grade, phase);
    return major.questions.filter(q => q.isCritical || q.autoRedFlag);
  } catch (error) {
    throw new Error(`Failed to get critical questions: ${error.message}`);
  }
}

/**
 * Fetch all questions for a specific domain across all phases
 * @param {number} grade - Grade level (6-10)
 * @param {string} domain - Domain name (e.g., "Mood", "Academic", "Bullying", "Safety")
 * @returns {Promise<Array>} Questions from that domain
 */
async function getQuestionsByDomain(grade, domain) {
  const domainQuestions = [];
  
  for (let phase = 1; phase <= 4; phase++) {
    try {
      const phaseData = await getQuestionsByGradeAndPhase(grade, phase);
      
      // Filter major questions
      if (phaseData.major) {
        const majorDomainQs = phaseData.major.questions.filter(q => 
          q.domain.toLowerCase() === domain.toLowerCase()
        );
        domainQuestions.push(...majorDomainQs.map(q => ({...q, phase, type: 'major'})));
      }

      // Filter mini questions
      phaseData.minis.forEach(mini => {
        if (mini.scenarios) {
          mini.scenarios.forEach(scenario => {
            const scenarioDomainQs = scenario.questions.filter(q =>
              q.domain.toLowerCase() === domain.toLowerCase()
            );
            domainQuestions.push(...scenarioDomainQs.map(q => ({
              ...q,
              phase,
              type: 'mini',
              scenario: scenario.scenarioId
            })));
          });
        }
      });

    } catch (error) {
      console.warn(`Could not load Phase ${phase}: ${error.message}`);
    }
  }

  return domainQuestions;
}

module.exports = {
  getQuestionsByGrade,
  getQuestionsByPhase,
  getQuestionsByGradeAndPhase,
  getMajorAssessment,
  getAdaptiveMiniQuestions,
  getAnchorItems,
  getCriticalQuestions,
  getQuestionsByDomain
};
