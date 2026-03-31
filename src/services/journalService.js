import { db } from '../integrations/firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, onSnapshot } from 'firebase/firestore';

/**
 * Save a journal entry for a student
 * @param {Object} params - Journal entry parameters
 * @param {string} params.studentId - Student's user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional, null for independent schools)
 * @param {string} params.prompt - The journal prompt
 * @param {string} params.content - The journal entry content
 */
export async function saveJournalEntry({
  studentId,
  adminId,
  schoolId,
  organizationId,
  prompt,
  content
}) {
  console.log('[saveJournalEntry] Saving journal entry for student:', studentId);
  
  try {
    // Determine the correct path based on school type
    let journalPath;
    
    if (organizationId) {
      // Organization school
      journalPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    } else {
      // Independent school
      journalPath = `users/${adminId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    }
    
    console.log('[saveJournalEntry] Saving to path:', journalPath);
    
    // Create journal entry document
    const journalData = {
      prompt,
      content,
      created_at: serverTimestamp()
    };
    
    const journalRef = await addDoc(
      collection(db, journalPath),
      journalData
    );
    
    console.log('[saveJournalEntry] Journal entry saved successfully:', journalRef.id);
    return { success: true, entryId: journalRef.id };
    
  } catch (error) {
    console.error('[saveJournalEntry] Error saving journal entry:', error);
    throw error;
  }
}

/**
 * Get all journal entries for a student
 * @param {Object} params - Query parameters
 * @param {string} params.studentId - Student's user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getJournalEntries({
  studentId,
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getJournalEntries] Fetching journal entries for student:', studentId);
  
  try {
    // Determine the correct path
    let journalPath;
    
    if (organizationId) {
      journalPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    } else {
      journalPath = `users/${adminId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    }
    
    console.log('[getJournalEntries] Fetching from path:', journalPath);
    
    // Query journal entries ordered by date (newest first)
    const journalQuery = query(
      collection(db, journalPath),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(journalQuery);
    
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate()
    }));
    
    console.log('[getJournalEntries] Found journal entries:', entries.length);
    return entries;
    
  } catch (error) {
    console.error('[getJournalEntries] Error fetching journal entries:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for journal entries
 * @param {Object} params - Query parameters
 * @param {string} params.studentId - Student's user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToJournalEntries({
  studentId,
  adminId,
  schoolId,
  organizationId
}, callback) {
  console.log('[subscribeToJournalEntries] Setting up real-time listener for student:', studentId);
  
  try {
    // Determine the correct path
    let journalPath;
    
    if (organizationId) {
      journalPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    } else {
      journalPath = `users/${adminId}/schools/${schoolId}/students/${studentId}/journal_entries`;
    }
    
    console.log('[subscribeToJournalEntries] Listening to path:', journalPath);
    
    // Create real-time query
    const journalQuery = query(
      collection(db, journalPath),
      orderBy('created_at', 'desc')
    );
    
    // Set up listener
    const unsubscribe = onSnapshot(
      journalQuery,
      (snapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate()
        }));
        
        console.log('[subscribeToJournalEntries] Real-time update received:', entries.length, 'entries');
        callback(entries);
      },
      (error) => {
        console.error('[subscribeToJournalEntries] Error in real-time listener:', error);
      }
    );
    
    return unsubscribe;
    
  } catch (error) {
    console.error('[subscribeToJournalEntries] Error setting up listener:', error);
    throw error;
  }
}
