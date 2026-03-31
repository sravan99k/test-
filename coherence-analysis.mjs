import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, 'src/components/assessments');

console.log('=== MAJOR-MINI COHERENCE ANALYSIS ===\n');
console.log('Analyzing follow-up logic across all grades and phases...\n');

const grades = [6, 7, 8, 9, 10];
const phases = [1, 2, 3, 4];

const coherenceReport = [];

grades.forEach(grade => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`GRADE ${grade} - COMPREHENSIVE ANALYSIS`);
    console.log('='.repeat(60));

    phases.forEach(phase => {
        const phaseDir = path.join(baseDir, `grade-${grade}`, `phase-${phase}`);

        try {
            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.json'));

            let major = null;
            const minis = [];

            files.forEach(file => {
                const data = JSON.parse(fs.readFileSync(path.join(phaseDir, file), 'utf8'));
                if (file.includes('major')) {
                    major = { file, data };
                } else {
                    minis.push({ file, data });
                }
            });

            if (!major) {
                console.log(`\n  Phase ${phase}: ⚠️  NO MAJOR FOUND`);
                return;
            }

            console.log(`\n  Phase ${phase}: ${major.data.metadata?.assessmentName}`);
            console.log('  ' + '-'.repeat(55));

            // Analyze major assessment
            const majorDomains = major.data.metadata?.domainsCovered || [];
            const majorQuestions = major.data.questions?.length || 0;
            const majorPurpose = major.data.metadata?.purpose || '';

            console.log(`  📋 MAJOR: ${major.file}`);
            console.log(`      Questions: ${majorQuestions}`);
            console.log(`      Domains: ${majorDomains.join(', ')}`);
            console.log(`      Purpose: ${majorPurpose}`);

            // Analyze subdomains from actual questions
            const majorSubdomains = new Set();
            major.data.questions?.forEach(q => {
                if (q.subdomain) majorSubdomains.add(q.subdomain);
            });
            console.log(`      Subdomains screened: ${majorSubdomains.size} (${Array.from(majorSubdomains).slice(0, 5).join(', ')}...)`);

            // Analyze minis
            if (minis.length === 0) {
                console.log(`\n  ❌ NO MINI ASSESSMENTS for follow-up`);
            } else {
                console.log(`\n  📌 MINI ASSESSMENTS (${minis.length}):`);

                minis.forEach((mini, idx) => {
                    const miniDomains = mini.data.metadata?.domainsCovered || [];
                    const miniQuestions = mini.data.questions?.length || 0;
                    const miniName = mini.data.metadata?.assessmentName || mini.file;
                    const miniPurpose = mini.data.metadata?.purpose || '';

                    console.log(`\n      [${idx + 1}] ${mini.file}`);
                    console.log(`          Name: ${miniName}`);
                    console.log(`          Questions: ${miniQuestions}`);
                    console.log(`          Domains: ${miniDomains.join(', ')}`);
                    console.log(`          Purpose: ${miniPurpose}`);

                    // Check domain overlap
                    const sharedDomains = miniDomains.filter(d => majorDomains.includes(d));
                    const newDomains = miniDomains.filter(d => !majorDomains.includes(d));

                    console.log(`          ✓ Shared domains with major: ${sharedDomains.join(', ') || 'None'}`);
                    if (newDomains.length > 0) {
                        console.log(`          ⚠️  New domains not in major: ${newDomains.join(', ')}`);
                    }

                    // Analyze subdomain focus
                    const miniSubdomains = new Set();
                    mini.data.questions?.forEach(q => {
                        if (q.subdomain) miniSubdomains.add(q.subdomain);
                    });

                    const subdomainOverlap = Array.from(miniSubdomains).filter(s => majorSubdomains.has(s));
                    const subdomainNew = Array.from(miniSubdomains).filter(s => !majorSubdomains.has(s));

                    if (subdomainOverlap.length > 0) {
                        console.log(`          🔄 Follow-up subdomains: ${subdomainOverlap.slice(0, 3).join(', ')}${subdomainOverlap.length > 3 ? '...' : ''}`);
                    }
                    if (subdomainNew.length > 0) {
                        console.log(`          🆕 New focus areas: ${subdomainNew.slice(0, 3).join(', ')}${subdomainNew.length > 3 ? '...' : ''}`);
                    }

                    // Coherence assessment
                    let coherenceScore = 0;
                    let coherenceNotes = [];

                    if (sharedDomains.length >= 2) {
                        coherenceScore += 2;
                        coherenceNotes.push('Good domain overlap');
                    } else if (sharedDomains.length === 1) {
                        coherenceScore += 1;
                        coherenceNotes.push('Limited domain overlap');
                    } else {
                        coherenceNotes.push('⚠️  No shared domains');
                    }

                    if (subdomainOverlap.length >= 3) {
                        coherenceScore += 2;
                        coherenceNotes.push('Strong follow-up on specific issues');
                    } else if (subdomainOverlap.length > 0) {
                        coherenceScore += 1;
                        coherenceNotes.push('Some follow-up on specific issues');
                    }

                    if (miniPurpose.toLowerCase().includes('follow') ||
                        miniPurpose.toLowerCase().includes('recheck') ||
                        miniPurpose.toLowerCase().includes('re-check')) {
                        coherenceScore += 1;
                        coherenceNotes.push('Explicit follow-up purpose');
                    }

                    const coherenceLevel = coherenceScore >= 4 ? '✅ EXCELLENT' :
                        coherenceScore >= 3 ? '✅ GOOD' :
                            coherenceScore >= 2 ? '⚠️  MODERATE' : '❌ WEAK';

                    console.log(`\n          Coherence: ${coherenceLevel} (${coherenceNotes.join(', ')})`);

                    coherenceReport.push({
                        grade,
                        phase,
                        major: major.data.metadata?.assessmentName,
                        mini: miniName,
                        score: coherenceScore,
                        level: coherenceLevel,
                        sharedDomains: sharedDomains.length,
                        subdomainOverlap: subdomainOverlap.length
                    });
                });
            }

        } catch (e) {
            console.log(`\n  Phase ${phase}: ⚠️  ERROR - ${e.message}`);
        }
    });
});

// Summary statistics
console.log('\n\n' + '='.repeat(60));
console.log('COHERENCE SUMMARY');
console.log('='.repeat(60));

const excellentCount = coherenceReport.filter(r => r.score >= 4).length;
const goodCount = coherenceReport.filter(r => r.score === 3).length;
const moderateCount = coherenceReport.filter(r => r.score === 2).length;
const weakCount = coherenceReport.filter(r => r.score < 2).length;

console.log(`\nTotal Mini Assessments Analyzed: ${coherenceReport.length}`);
console.log(`✅ Excellent Coherence: ${excellentCount} (${Math.round(excellentCount / coherenceReport.length * 100)}%)`);
console.log(`✅ Good Coherence: ${goodCount} (${Math.round(goodCount / coherenceReport.length * 100)}%)`);
console.log(`⚠️  Moderate Coherence: ${moderateCount} (${Math.round(moderateCount / coherenceReport.length * 100)}%)`);
console.log(`❌ Weak Coherence: ${weakCount} (${Math.round(weakCount / coherenceReport.length * 100)}%)`);

// Identify issues
console.log('\n\n' + '='.repeat(60));
console.log('ISSUES & RECOMMENDATIONS');
console.log('='.repeat(60));

const issues = coherenceReport.filter(r => r.score < 3);
if (issues.length > 0) {
    console.log('\n⚠️  Assessments needing coherence improvement:');
    issues.forEach(issue => {
        console.log(`   - Grade ${issue.grade} Phase ${issue.phase}: ${issue.mini}`);
        console.log(`     Reason: ${issue.sharedDomains} shared domains, ${issue.subdomainOverlap} subdomain overlap`);
    });
} else {
    console.log('\n✅ All assessments show good or excellent coherence!');
}

console.log('\n\n=== ANALYSIS COMPLETE ===\n');
