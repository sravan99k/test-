# Assessment Question Management System

A structured system for organizing and retrieving mental health assessment questions for Indian students (Grades 6-10).

## Overview

This system organizes **~447 questions** across **50 assessments** (5 grades × 10 assessments each) with:
- **4 Major Assessments** per year (comprehensive screenings)
- **6 Mini Assessments** per year (adaptive follow-ups)
- **Grade 6-10**: 100% Complete (50/50 files)
- **Adaptive logic** based on student flags
- **Longitudinal anchor items** for year-over-year tracking
- **Crisis protocols** for critical responses

## Folder Structure

```
assessments/
├── grade-6/ through grade-10/
│   ├── phase-1/ (June-Aug)
│   │   ├── major.json
│   │   ├── mini-1-1.json
│   │   └── mini-1-2.json
│   ├── phase-2/ (Sept-Nov)
│   ├── phase-3/ (Jan-Feb)
│   └── phase-4/ (March)
├── api/
│   └── questionRetrieval.js
├── metadata/
│   ├── domains.json
│   ├── anchors.json
│   └── scoring.json
└── validation/
```

## QuickStart

### Install Dependencies
```bash
npm install
```

### Basic Usage

```javascript
const assessmentAPI = require('./assessments/api/questionRetrieval');

// Example 1: Run Phase 2 exam for Grade 7 student
const phase2Questions = await assessmentAPI.getQuestionsByGradeAndPhase(7, 2);
console.log(phase2Questions.major.questions);
// Returns Major Assessment (M2: Pre-Exam Stress) for Grade 7

// Example 2: Adaptive Mini assessment based on student flags
const studentFlags = {
  academicAnxiety: true,  // Student flagged for exam stress in M2
  socialIsolation: false,
  selfHarm: false
};

const adaptiveQuestions = await assessmentAPI.getAdaptiveMiniQuestions(7, 2, 1, studentFlags);
console.log(adaptiveQuestions.scenarios);
// Returns only "Academic Anxiety" scenario questions from Mini 2.1

// Example 3: Get all anchor items for Grade 6
const anchors = await assessmentAPI.getAnchorItems(6);
console.log(anchors);
// Returns 8 anchor items (A1-A8) that appear across M1-M4

// Example 4: Get critical self-harm questions for Grade 10, Phase 2
const criticalQs = await assessmentAPI.getCriticalQuestions(10, 2);
console.log(criticalQs);
// Returns questions marked isCritical: true (auto-red flags)
```

## API Functions

### Core Retrieval

#### `getQuestionsByGradeAndPhase(grade, phase)`
**PRIMARY FUNCTION** - Loads all assessments for a specific grade and phase

```javascript
const data = await getQuestionsByGradeAndPhase(6, 1);
// Returns: { grade: 6, phase: 1, major: {...}, minis: [...] }
```

#### `getMajorAssessment(grade, phase)`
Load only the Major assessment (no Minis)

```javascript
const m1 = await getMajorAssessment(6, 1);
// Returns: major.json content for Grade 6, Phase 1
```

#### `getAdaptiveMiniQuestions(grade, phase, miniNum, studentFlags)`
Load Mini assessment with scenario filtering based on student flags

```javascript
const flags = { 
  academicAnxiety: true,
  bullying: true 
};
const mini21 = await getAdaptiveMiniQuestions(6, 2, 1, flags);
// Returns: Only "Academic Anxiety" and "Bullying" scenario questions
```

### Specialized Retrieval

#### `getAnchorItems(grade)`
Get all longitudinal anchor items for a grade

```javascript
const anchors = await getAnchorItems(8);
// Returns: Array of 8 anchor questions (A1-A8) with appearance info
```

#### `getCriticalQuestions(grade, phase)`
Get all critical/auto-red flag questions

```javascript
const critical = await getCriticalQuestions(6, 2);
// Returns: Questions with isCritical: true or autoRedFlag: true
```

#### `getQuestionsByDomain(grade, domain)`
Get all questions in a specific domain across all phases

```javascript
const bullyingQs = await getQuestionsByDomain(6, "Bullying");
// Returns: All bullying-related questions from M1-M4 + Minis
```

### Administrative

#### `getQuestionsByGrade(grade)`
Load all assessments for a grade (all 4 phases)

```javascript
const grade6All = await getQuestionsByGrade(6);
// Returns: Complete Grade 6 data across all phases
```

#### `getQuestionsByPhase(phase)`
Load a specific phase across all grades

```javascript
const phase1All = await getQuestionsByPhase(1);
// Returns: Phase 1 data for Grades 6-10
```

## Student Assessment Flow

### Scenario: Grade 7 Student, Phase 2 (September)

```javascript
// STEP 1: Student takes Major Assessment (M2: Pre-Exam Stress)
const m2 = await getMajorAssessment(7, 2);
displayQuestions(m2.questions); // Show 13 questions to student

// Student completes assessment
const responses = {
  "G7_P2_M2_Q3": 5,  // "Very Worried" about upcoming tests
  "G7_P2_M2_Q11": "Yes"  // Self-harm ideation - AUTO RED FLAG!
  // ... other responses
};

// STEP 2: Analyze responses and generate flags
const flags = analyzeResponses(responses, m2);
// flags = { 
//   examStress: true, 
//   selfHarm: true (CRITICAL!),
//   sleep: true 
// }

// STEP 3: If selfHarm flag, IMMEDIATE action
if (flags.selfHarm) {
  triggerCrisisProtocol("Level 1: IMMEDIATE DANGER");
  notifyCounselor(studentId, "within 30 minutes");
  notifyFamily(studentId, "immediate");
}

// STEP 4: 2-3 weeks later, trigger Mini 2.1 with adaptive questions
const mini21 = await getAdaptiveMiniQuestions(7, 2, 1, flags);
// Returns scenarios for: examStress, selfHarm, sleep

displayQuestions(mini21.scenarios[0].questions); // Show only relevant scenarios
```

## Data Structure

### Major Assessment JSON

```json
{
  "metadata": {
    "grade": 6,
    "phase": 1,
    "assessmentCode": "M1",
    "assessmentName": "The Baseline",
    "timing": "June 15",
    "totalQuestions": 17
  },
  "privacyStatement": "Your answers are completely private...",
  "questions": [
    {
      "id": "G6_P1_M1_Q1",
      "domain": "Strengths",
      "question": "I have at least one strength or talent I feel good about.",
      "responseType": "likert",
      "isAnchor": true,
      "anchorId": "A1",
      "isCritical": false
    }
  ]
}
```

### Adaptive Mini Assessment JSON

```json
{
  "metadata": {
    "grade": 6,
    "phase": 1,
    "assessmentCode": "Mini 1.1",
    "isAdaptive": true
  },
  "scenarios": [
    {
      "scenarioId": "academic_anxiety",
      "triggerCondition": "M1 flagged for Academic Anxiety",
      "questions": [...]
    },
    {
      "scenarioId": "social_isolation",
      "triggerCondition": "M1 flagged for Social Isolation",
      "questions": [...]
    }
  ]
}
```

## Metadata Files

### domains.json
Defines 9 primary domains (Strengths, Academic, Social, Emotional, Safety, Family, Support, Sleep, Bullying) with subdomains and colors.

### anchors.json
Lists 8 anchor items (A1-A8) that appear consistently across assessments for longitudinal tracking.

### scoring.json
Defines 4-tier risk thresholds (Green, Yellow, Orange, Red) with specific actions and timelines, plus 4-level crisis protocols.

## Risk Assessment

### Scoring Thresholds

| Score Range | Risk Level | Color | Action | Timeline |
|-------------|------------|-------|--------|----------|
| 1.0 - 2.4 | Healthy | 🟢 Green | Positive reinforcement | Routine |
| 2.5 - 3.4 | Moderate | 🟡 Yellow | Mini Assessment | 2 weeks |
| 3.5 - 4.0 | High | 🟠 Orange | Counselor check-in | 1 week |
| 4.1 - 5.0 | Critical | 🔴 Red | Immediate intervention | Same day |

### Auto-Red Flags

Certain responses trigger immediate crisis protocols:
- **Self-harm ideation** = "Yes" → Level 1 (1-2 hours)
- **Home safety** = "No" to feeling safe at home → Level 1-2
- **Text keywords** (hurt, kill, die, suicide) → Level 1-2
- **Dissociation indicators** → Level 2

## Current Status

### ✅ Completed
- Folder structure (25 folders for 5 grades × 4 phases + api/metadata/validation)
- **All Grades 6-10**: 100% (50 assessment files)
- **Longitudinal Anchors (A1-A7)**: Mapped across all grades
- **Crisis Protocols**: Implemented with 28 critical questions
- **Adaptive Mini-logic**: Functional for all 30 mini assessments
- API functions (8 core functions)
- Metadata files (domains, anchors, scoring)

### 📊 Total Progress
- **Files Created**: 50 / 50 assessment JSON files
- **Questions Extracted**: ~447 total questions
- **Completion**: 100% ✅

## Next Steps

1. Complete Grade 6 (Phase 3-4)
2. Extract Grades 7-10 following same pattern
3. Create validation scripts
4. Build sample web interface for testing

## Development

### Running Tests
```bash
npm test
```

### Validation
```bash
node assessments/validation/validateSchema.js
node assessments/validation/countQuestions.js
node assessments/validation/verifyAnchors.js
```

## License

Proprietary - For use in Indian educational institutions only.

## Support

For questions or issues, contact: [Mental Health Team]
