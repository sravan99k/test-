import { db } from '../integrations/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getLatestAssessment } from './assessmentService';

/**
 * Get all students with their latest assessment data for a school
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getSchoolStudentsWithAssessments({
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getSchoolStudentsWithAssessments] Fetching students with assessments');
  
  try {
    // Determine students path
    let studentsPath;
    if (organizationId) {
      studentsPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students`;
    } else {
      studentsPath = `users/${adminId}/schools/${schoolId}/students`;
    }
    
    // Get all students
    const studentsSnapshot = await getDocs(collection(db, studentsPath));
    
    // Fetch latest assessment for each student
    const studentsWithAssessments = await Promise.all(
      studentsSnapshot.docs.map(async (studentDoc) => {
        const studentData = studentDoc.data();
        const studentId = studentDoc.id;
        
        try {
          // Get latest assessment
          const latestAssessment = await getLatestAssessment({
            studentId,
            adminId,
            schoolId,
            organizationId
          });
          
          return {
            id: studentId,
            name: studentData.name || '',
            email: studentData.email || '',
            grade: studentData.grade || '',
            section: studentData.section || '',
            ...studentData,
            latestAssessment: latestAssessment || null
          };
        } catch (error) {
          console.error(`Error fetching assessment for student ${studentId}:`, error);
          return {
            id: studentId,
            name: studentData.name || '',
            email: studentData.email || '',
            grade: studentData.grade || '',
            section: studentData.section || '',
            ...studentData,
            latestAssessment: null
          };
        }
      })
    );
    
    return studentsWithAssessments;
  } catch (error) {
    console.error('[getSchoolStudentsWithAssessments] Error:', error);
    throw error;
  }
}

/**
 * Get aggregated risk statistics for a school
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getSchoolRiskStatistics({
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getSchoolRiskStatistics] Calculating risk statistics');
  
  try {
    const students = await getSchoolStudentsWithAssessments({
      adminId,
      schoolId,
      organizationId
    });
    
    const stats = {
      total: students.length,
      assessed: 0,
      notAssessed: 0,
      highRisk: 0,
      moderateRisk: 0,
      lowRisk: 0,
      averageRiskPercentage: 0
    };
    
    let totalRiskPercentage = 0;
    
    students.forEach(student => {
      if (student.latestAssessment) {
        stats.assessed++;
        totalRiskPercentage += student.latestAssessment.riskPercentage;
        
        switch (student.latestAssessment.riskCategory) {
          case 'High Risk':
            stats.highRisk++;
            break;
          case 'Moderate Risk':
            stats.moderateRisk++;
            break;
          case 'Low Risk':
            stats.lowRisk++;
            break;
        }
      } else {
        stats.notAssessed++;
      }
    });
    
    if (stats.assessed > 0) {
      stats.averageRiskPercentage = totalRiskPercentage / stats.assessed;
    }
    
    return stats;
  } catch (error) {
    console.error('[getSchoolRiskStatistics] Error:', error);
    throw error;
  }
}

/**
 * Get students filtered by risk category
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 * @param {string} params.riskCategory - "High Risk", "Moderate Risk", or "Low Risk"
 */
export async function getStudentsByRiskCategory({
  adminId,
  schoolId,
  organizationId,
  riskCategory
}) {
  console.log('[getStudentsByRiskCategory] Filtering by:', riskCategory);
  
  try {
    const students = await getSchoolStudentsWithAssessments({
      adminId,
      schoolId,
      organizationId
    });
    
    return students.filter(student => 
      student.latestAssessment && 
      student.latestAssessment.riskCategory === riskCategory
    );
  } catch (error) {
    console.error('[getStudentsByRiskCategory] Error:', error);
    throw error;
  }
}

/**
 * Get students who haven't taken any assessment
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getUnassessedStudents({
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getUnassessedStudents] Fetching students without assessments');
  
  try {
    const students = await getSchoolStudentsWithAssessments({
      adminId,
      schoolId,
      organizationId
    });
    
    return students.filter(student => !student.latestAssessment);
  } catch (error) {
    console.error('[getUnassessedStudents] Error:', error);
    throw error;
  }
}

/**
 * Get risk distribution data for charts
 * @param {Object} params
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getRiskDistributionData({
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getRiskDistributionData] Preparing chart data');
  
  try {
    const stats = await getSchoolRiskStatistics({
      adminId,
      schoolId,
      organizationId
    });
    
    return {
      labels: ['High Risk', 'Moderate Risk', 'Low Risk', 'Not Assessed'],
      data: [stats.highRisk, stats.moderateRisk, stats.lowRisk, stats.notAssessed],
      colors: ['#ef4444', '#f59e0b', '#10b981', '#6b7280']
    };
  } catch (error) {
    console.error('[getRiskDistributionData] Error:', error);
    throw error;
  }
}

/**
 * Get assessment trends over time for a student
 * @param {Object} params
 * @param {string} params.studentId - Student user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getStudentRiskTrend({
  studentId,
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getStudentRiskTrend] Fetching trend data');
  
  try {
    const { getStudentAssessments } = await import('./assessmentService');
    
    const assessments = await getStudentAssessments({
      studentId,
      adminId,
      schoolId,
      organizationId
    });
    
    // Reverse to show oldest to newest
    const sortedAssessments = [...assessments].reverse();
    
    return {
      labels: sortedAssessments.map((a, i) => `Assessment ${i + 1}`),
      dates: sortedAssessments.map(a => a.assessmentDate),
      riskPercentages: sortedAssessments.map(a => a.riskPercentage),
      riskCategories: sortedAssessments.map(a => a.riskCategory)
    };
  } catch (error) {
    console.error('[getStudentRiskTrend] Error:', error);
    throw error;
  }
}
