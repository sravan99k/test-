/**
 * Generate assessment ID based on grade, phase, and assessment type
 * @param {number} grade - Grade number (e.g., 6, 7, 8, 9)
 * @param {string} phase - Phase identifier (e.g., 'p1', 'p2', 'p3')
 * @param {string} type - Assessment type ('major', 'mini')
 * @param {string} name - Assessment name (optional)
 * @returns {string} Generated assessment ID
 */
export function generateAssessmentId(grade: number, phase: string, type: string, name?: string): string {
  // Clean and normalize inputs
  const cleanGrade = grade.toString();
  const cleanPhase = phase.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanType = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  
  // Create base ID
  let baseId = `g${cleanGrade}-${cleanPhase}-${cleanType}`;
  
  // Add name if provided
  if (cleanName) {
    baseId += `-${cleanName}`;
  }
  
  return baseId;
}

/**
 * Parse assessment ID to extract components
 * @param {string} assessmentId - Assessment ID to parse
 * @returns {Object} Parsed components or null if invalid
 */
export function parseAssessmentId(assessmentId: string): {
  grade: number;
  phase: string;
  type: string;
  name?: string;
} | null {
  try {
    const parts = assessmentId.split('-');
    
    if (parts.length < 3) {
      return null;
    }
    
    // Extract grade (remove 'g' prefix)
    const gradePart = parts[0];
    if (!gradePart.startsWith('g')) {
      return null;
    }
    const grade = parseInt(gradePart.substring(1));
    
    if (isNaN(grade)) {
      return null;
    }
    
    const phase = parts[1];
    const type = parts[2];
    const name = parts.length > 3 ? parts.slice(3).join('-') : undefined;
    
    return {
      grade,
      phase,
      type,
      name
    };
  } catch (error) {
    console.error('Error parsing assessment ID:', error);
    return null;
  }
}

/**
 * Validate assessment ID format
 * @param {string} assessmentId - Assessment ID to validate
 * @returns {boolean} True if valid format
 */
export function isValidAssessmentId(assessmentId: string): boolean {
  return parseAssessmentId(assessmentId) !== null;
}
