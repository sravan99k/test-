/**
 * Assessment Question Management System - UsageExamples.js
 * Demonstrates how to use the API in real-world scenarios
 */

const assessmentAPI = require('./api/questionRetrieval');

// ===============================================
// EXAMPLE 1: Running a Phase Exam
// ===============================================

async function runPhaseExam(studentGrade, currentPhase) {
    console.log(`\n=== Running Phase ${currentPhase} Exam for Grade ${studentGrade} ===\n`);

    try {
        // Load all questions for this grade and phase
        const phaseData = await assessmentAPI.getQuestionsByGradeAndPhase(studentGrade, currentPhase);

        console.log(`Major Assessment: ${phaseData.major.metadata.assessmentName}`);
        console.log(`Total Questions: ${phaseData.major.metadata.totalQuestions}`);
        console.log(`Estimated Time: ${phaseData.major.metadata.estimatedTimeMinutes} minutes\n`);



        // Display questions to student
        console.log("\n--- Questions ---");
        phaseData.major.questions.forEach((q, index) => {
            console.log(`\nQ${index + 1}: ${q.question}`);
            console.log(`   Response Type: ${q.responseType}`);
            if (q.isAnchor) {
                console.log(`   [ANCHOR ITEM: ${q.anchorId}]`);
            }
            if (q.isCritical) {
                console.log(`   ⚠️ [CRITICAL QUESTION - Auto-Red Flag]`);
            }
        });

        return phaseData.major;

    } catch (error) {
        console.error(`Error loading exam: ${error.message}`);
    }
}

// ===============================================
// EXAMPLE 2: Adaptive Mini Assessment
// ===============================================

async function runAdaptiveMini(studentGrade, phase, miniNum, studentProfile) {
    console.log(`\n=== Running Adaptive Mini ${miniNum} for Grade ${studentGrade}, Phase ${phase} ===\n`);

    // Example student profile from previous Major assessment
    const flags = {
        academicAnxiety: studentProfile.examStressScore >= 4,
        socialIsolation: studentProfile.friendshipScore <= 2,
        selfHarm: studentProfile.selfHarmResponse === "Yes",
        bullying: studentProfile.bullyingExperience === "Yes",
        noFlags: false  // Will be auto-calculated
    };

    // Calculate noFlags
    flags.noFlags = !Object.entries(flags)
        .filter(([key, _]) => key !== 'noFlags')
        .some(([_, value]) => value === true);

    console.log("Student Flags:", flags);

    try {
        const miniData = await assessmentAPI.getAdaptiveMiniQuestions(studentGrade, phase, miniNum, flags);

        console.log(`\nMini Assessment: ${miniData.metadata.assessmentName}`);
        console.log(`Adaptive: ${miniData.metadata.isAdaptive}`);
        console.log(`Active Scenarios: ${miniData.scenarios.length}`);

        // Display only relevant scenario questions
        miniData.scenarios.forEach(scenario => {
            console.log(`\n--- Scenario: ${scenario.scenarioName} ---`);
            console.log(`Trigger: ${scenario.triggerCondition}`);
            console.log(`Questions: ${scenario.questions.length}\n`);

            scenario.questions.forEach((q, index) => {
                console.log(`Q${index + 1}: ${q.question}`);
            });
        });

        return miniData;

    } catch (error) {
        console.error(`Error loading adaptive Mini: ${error.message}`);
    }
}

// ===============================================
// EXAMPLE 3: Crisis Detection & Response
// ===============================================

function checkForCrisisFlags(responses, assessmentQuestions) {
    console.log("\n=== Crisis Flag Check ===\n");

    const criticalFlags = [];

    assessmentQuestions.forEach(question => {
        const response = responses[question.id];

        // Check for auto-red flag conditions
        if (question.isCritical || question.autoRedFlag) {
            if (question.responseType === "yes_no_prefer" && response === "Yes") {
                criticalFlags.push({
                    questionId: question.id,
                    question: question.question,
                    response: response,
                    severity: "IMMEDIATE DANGER",
                    protocol: "Level 1",
                    action: "Counselor contact within 30 minutes + Emergency family notification"
                });
            }
        }


    });

    if (criticalFlags.length > 0) {
        console.log("🚨 CRITICAL FLAGS DETECTED 🚨\n");
        criticalFlags.forEach(flag => {
            console.log(`Question: ${flag.question}`);
            console.log(`Response: ${flag.response}`);
            console.log(`Severity: ${flag.severity}`);
            console.log(`Protocol: ${flag.protocol}`);
            console.log(`Action: ${flag.action}`);
            console.log("-".repeat(60));
        });

        return criticalFlags;
    } else {
        console.log("✅ No critical flags detected");
        return [];
    }
}

// ===============================================
// EXAMPLE 4: Longitudinal Anchor Tracking
// ===============================================

async function trackStudentGrowth(studentId, studentGrade) {
    console.log(`\n=== Tracking Growth for Student ${studentId}, Grade ${studentGrade} ===\n`);

    try {
        const anchors = await assessmentAPI.getAnchorItems(studentGrade);

        console.log(`Found ${anchors.length} anchor items\n`);

        // Example: Simulate student responses across M1 and M4
        const studentAnchorScores = {
            M1: {  // June
                A1: 3.5,  // "I have at least one strength..." (Strength)
                A2: 3.5,  // "Felt happy coming to school" (Mood)
                A4: 3.8,  // "Confident handling schoolwork" (Academic)
                A5: 3.2,  // "Have close friend" (Social)
                A7: 3.2   // "Hopeful about school year" (Hope)
            },
            M4: {  // March
                A1: 2.0,  // Improved
                A2: 2.1,  // Improved
                A4: 2.5,  // Improved
                A5: 2.2,  // Improved
                A7: 2.0   // Improved
            }
        };

        console.log("Anchor Item Growth Analysis:");
        console.log("=".repeat(60));

        anchors.forEach(anchor => {
            if (studentAnchorScores.M1[anchor.anchorId] && studentAnchorScores.M4[anchor.anchorId]) {
                const juneScore = studentAnchorScores.M1[anchor.anchorId];
                const marchScore = studentAnchorScores.M4[anchor.anchorId];
                const change = marchScore - juneScore;

                const status = change < -1.0 ? "✅ IMPROVED" :
                    change > 1.0 ? "⚠️ WORSENED" :
                        "→ STABLE";

                console.log(`\n${anchor.anchorId} - ${anchor.domain}`);
                console.log(`Question: "${anchor.question}"`);
                console.log(`June (M1): ${juneScore.toFixed(1)}`);
                console.log(`March (M4): ${marchScore.toFixed(1)}`);
                console.log(`Change: ${change.toFixed(1)} ${status}`);
            }
        });

    } catch (error) {
        console.error(`Error tracking growth: ${error.message}`);
    }
}

// ===============================================
// EXAMPLE 5: Domain-Specific Analysis
// ===============================================

async function analyzeDomain(studentGrade, domainName) {
    console.log(`\n=== Analyzing ${domainName} Domain for Grade ${studentGrade} ===\n`);

    try {
        const domainQuestions = await assessmentAPI.getQuestionsByDomain(studentGrade, domainName);

        console.log(`Total ${domainName} questions across all phases: ${domainQuestions.length}\n`);

        // Group by phase
        const byPhase = {};
        domainQuestions.forEach(q => {
            if (!byPhase[q.phase]) {
                byPhase[q.phase] = [];
            }
            byPhase[q.phase].push(q);
        });

        Object.keys(byPhase).sort().forEach(phase => {
            const questions = byPhase[phase];
            console.log(`\nPhase ${phase}: ${questions.length} questions`);
            questions.forEach(q => {
                console.log(`  - [${q.type.toUpperCase()}] ${q.question.substring(0, 60)}...`);
            });
        });

    } catch (error) {
        console.error(`Error analyzing domain: ${error.message}`);
    }
}

// ===============================================
// RUN EXAMPLES
// ===============================================

async function main() {
    console.log("\n" + "=".repeat(80));
    console.log("        ASSESSMENT QUESTION MANAGEMENT SYSTEM - USAGE EXAMPLES");
    console.log("=".repeat(80));

    // Example 1: Run Phase 2 exam for Grade 7
    await runPhaseExam(7, 2);

    // Example 2: Adaptive Mini for student with academic anxiety
    const studentProfile = {
        examStressScore: 5,    // Very worried (triggers academic anxiety)
        friendshipScore: 4,    // Good friendships (no social isolation)
        selfHarmResponse: "No", // No self-harm
        bullyingExperience: "No" // No bullying
    };
    await runAdaptiveMini(7, 2, 1, studentProfile);

    // Example 3: Check for crisis flags
    const sampleResponses = {
        "G6_P2_M2_Q11": "Yes",  // Self-harm ideation - CRITICAL!
        "G6_P2_M2_Q12": "I feel like I can't do this anymore, everything is too much"
    };

    const major = await assessmentAPI.getMajorAssessment(6, 2);
    checkForCrisisFlags(sampleResponses, major.questions);

    // Example 4: Track student growth using anchors
    await trackStudentGrowth("STU12345", 6);

    // Example 5: Analyze all Bullying questions for Grade 6
    await analyzeDomain(6, "Bullying");

    console.log("\n" + "=".repeat(80));
    console.log("                         EXAMPLES COMPLETE");
    console.log("=".repeat(80) + "\n");
}

// Uncomment to run examples
// main().catch(console.error);

module.exports = {
    runPhaseExam,
    runAdaptiveMini,
    checkForCrisisFlags,
    trackStudentGrowth,
    analyzeDomain
};
