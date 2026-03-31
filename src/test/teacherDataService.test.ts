import { describe, it, expect } from 'vitest';
import { calculateAnalyticsFromStudents, type TeacherStudent } from '@/services/teacherDataService';

describe('calculateAnalyticsFromStudents', () => {
    it('returns zero analytics for empty student array', () => {
        const result = calculateAnalyticsFromStudents([]);

        expect(result).toEqual({
            totalStudents: 0,
            averageWellbeing: 0,
            engagementRate: 0,
            performanceData: []
        });
    });

    it('calculates correct average wellbeing score', () => {
        const students: TeacherStudent[] = [
            {
                uid: '1',
                name: 'Student 1',
                class: 'Grade 7A',
                riskLevel: 'low',
                wellbeingScore: 80,
                engagementRate: 90,
                lastActivity: '2024-01-15'
            },
            {
                uid: '2',
                name: 'Student 2',
                class: 'Grade 7A',
                riskLevel: 'medium',
                wellbeingScore: 60,
                engagementRate: 70,
                lastActivity: '2024-01-14'
            }
        ];

        const result = calculateAnalyticsFromStudents(students);

        expect(result.totalStudents).toBe(2);
        expect(result.averageWellbeing).toBe(70); // (80 + 60) / 2
        expect(result.engagementRate).toBe(80); // (90 + 70) / 2
    });

    it('generates performance data for last 3 months', () => {
        const students: TeacherStudent[] = [
            {
                uid: '1',
                name: 'Student 1',
                class: 'Grade 7A',
                riskLevel: 'low',
                wellbeingScore: 85,
                engagementRate: 90,
                lastActivity: '2024-01-15'
            }
        ];

        const result = calculateAnalyticsFromStudents(students);

        expect(result.performanceData).toHaveLength(3);
        expect(result.performanceData[0]).toHaveProperty('month');
        expect(result.performanceData[0]).toHaveProperty('wellbeingScore');
        expect(result.performanceData[0]).toHaveProperty('engagementScore');
    });

    it('rounds wellbeing score to nearest integer', () => {
        const students: TeacherStudent[] = [
            {
                uid: '1',
                name: 'Student 1',
                class: 'Grade 7A',
                riskLevel: 'low',
                wellbeingScore: 75,
                engagementRate: 80,
                lastActivity: '2024-01-15'
            },
            {
                uid: '2',
                name: 'Student 2',
                class: 'Grade 7A',
                riskLevel: 'medium',
                wellbeingScore: 76,
                engagementRate: 82,
                lastActivity: '2024-01-14'
            }
        ];

        const result = calculateAnalyticsFromStudents(students);

        // (75 + 76) / 2 = 75.5, should round to 76
        expect(result.averageWellbeing).toBe(76);
    });
});
