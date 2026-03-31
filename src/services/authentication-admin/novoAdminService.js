import { app, db } from "../integrations/firebase";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  doc, 
  setDoc, 
  serverTimestamp, 
  updateDoc, 
  arrayUnion,
  getDoc,
  deleteDoc,
  getDocs
} from "firebase/firestore";
import { createUserWithProfile } from "./authService";

// Helper function to create human-readable slugs from names
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

// Helper function to create unique slug by checking if it exists
async function createUniqueSlug(basePath, name) {
  let slug = createSlug(name);
  let counter = 1;
  
  // Check if slug exists, if yes, append number
  while (true) {
    const docRef = doc(db, basePath, slug);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return slug; // Slug is unique
    }
    
    // Slug exists, try with counter
    slug = `${createSlug(name)}-${counter}`;
    counter++;
  }
}

// Create or reuse a secondary Firebase app to avoid switching the main auth user
export function getSecondaryAuth() {
  const name = "SecondaryApp";
  const secondary = getApps().find((a) => a.name === name) || initializeApp(app.options, name);
  return getAuth(secondary);
}

export async function addOrganization({
  name,
  type, // "NGO" | "CORPORATE" | "GOVERNMENT" | "ORGANIZATION"
  location,
  email,
  password,
  phone,
  adminName,
  adminUserId, // The admin user ID who is creating this organization
}) {
  console.log('[addOrganization] Starting organization creation...');
  
  try {
    // 1) Create Auth user for organization first
    const secondaryAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    console.log('[addOrganization] Auth user created:', cred.user.uid);

    // 2) Create organization with human-readable ID (slug)
    const orgSlug = await createUniqueSlug(`users/${adminUserId}/organizations`, name);
    const orgRef = doc(db, `users/${adminUserId}/organizations`, orgSlug);
    
    await setDoc(orgRef, {
      name,
      type,
      location,
      email,
      phone,
      adminName,
      status: "active",
      createdAt: serverTimestamp(),
      organizationUserId: cred.user.uid
    });
    console.log('[addOrganization] Organization document created with slug:', orgSlug);

    // 3) Create /users document for organization
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "organization",
      slug: `org-${orgSlug}`,
      name: adminName,
      organizationId: orgRef.id,
      parentAdminId: adminUserId,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "active",
    });
    console.log('[addOrganization] User document created');

    console.log("Organization created:", orgSlug);
    return { organizationId: orgSlug, userId: cred.user.uid };
  } catch (error) {
    console.error('[addOrganization] Failed to create organization:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please use a different email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    }
    
    throw error;
  }
}

export async function addSchool({
  name,
  location,
  email,
  password,
  phone,
  adminName,
  studentCount,
  adminUserId, // The admin user ID
  organizationId, // Optional: The organization ID (subcollection ID under admin)
}) {
  console.log('[addSchool] Starting school creation...', { organizationId });
  
  try {
    // 1) Create Auth user for school first
    const secondaryAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    console.log('[addSchool] Auth user created:', cred.user.uid);

    // 2) Create school with human-readable ID (slug)
    let schoolSlug;
    let schoolRef;
    
    if (organizationId) {
      // School under organization
      console.log('[addSchool] Creating school under organization:', organizationId);
      schoolSlug = await createUniqueSlug(`users/${adminUserId}/organizations/${organizationId}/schools`, name);
      schoolRef = doc(db, `users/${adminUserId}/organizations/${organizationId}/schools`, schoolSlug);
      
      await setDoc(schoolRef, {
        name,
        location,
        email,
        phone,
        adminName,
        studentCount: Number(studentCount || 0),
        status: "active",
        createdAt: serverTimestamp(),
        schoolUserId: cred.user.uid,
        isIndependent: false
      });
    } else {
      // Independent school (directly under admin)
      console.log('[addSchool] Creating independent school');
      schoolSlug = await createUniqueSlug(`users/${adminUserId}/schools`, name);
      schoolRef = doc(db, `users/${adminUserId}/schools`, schoolSlug);
      
      await setDoc(schoolRef, {
        name,
        location,
        email,
        phone,
        adminName,
        studentCount: Number(studentCount || 0),
        status: "active",
        createdAt: serverTimestamp(),
        schoolUserId: cred.user.uid,
        isIndependent: true
      });
    }
    console.log('[addSchool] School document created with slug:', schoolSlug);

    // 3) Create /users document for school
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: "management", // School admin role
      slug: `school-${schoolSlug}`,
      name: adminName,
      schoolId: schoolSlug,
      organizationId: organizationId || null,
      parentAdminId: adminUserId,
      isIndependent: !organizationId,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      status: "active",
    });
    console.log('[addSchool] User document created');

    console.log("School created:", schoolSlug);
    return { schoolId: schoolSlug, userId: cred.user.uid };
  } catch (error) {
    console.error('[addSchool] Error creating school:', error);
    
    // Provide user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please use a different email address.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    }
    
    throw error;
  }
}

// Update organization
export async function updateOrganization({
  organizationId,
  adminUserId,
  name,
  type,
  location,
  email,
  phone,
  adminName
}) {
  console.log('[updateOrganization] Starting organization update...', organizationId);
  
  try {
    const orgRef = doc(db, `users/${adminUserId}/organizations`, organizationId);
    
    await updateDoc(orgRef, {
      name,
      type,
      location,
      email,
      phone,
      adminName,
      updatedAt: serverTimestamp()
    });
    
    console.log('[updateOrganization] Organization updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[updateOrganization] Error updating organization:', error);
    throw error;
  }
}

// Delete organization and all its schools
export async function deleteOrganization({
  organizationId,
  adminUserId
}) {
  console.log('[deleteOrganization] Starting organization deletion...', organizationId);
  
  try {
    // 1) Delete all schools under this organization
    const schoolsPath = `users/${adminUserId}/organizations/${organizationId}/schools`;
    const schoolsSnapshot = await getDocs(collection(db, schoolsPath));
    
    for (const schoolDoc of schoolsSnapshot.docs) {
      const schoolId = schoolDoc.id;
      const schoolData = schoolDoc.data();
      
      // Delete school's subcollections (students, teachers, etc.)
      await deleteSchoolSubcollections(schoolsPath, schoolId);
      
      // Delete the school document
      await deleteDoc(doc(db, schoolsPath, schoolId));
      
      // Delete the school's user document if it exists
      if (schoolData.schoolUserId) {
        await deleteDoc(doc(db, 'users', schoolData.schoolUserId));
      }
    }
    
    // 2) Get organization data to delete user document
    const orgRef = doc(db, `users/${adminUserId}/organizations`, organizationId);
    const orgSnap = await getDoc(orgRef);
    
    if (orgSnap.exists()) {
      const orgData = orgSnap.data();
      
      // Delete organization's user document if it exists
      if (orgData.organizationUserId) {
        await deleteDoc(doc(db, 'users', orgData.organizationUserId));
      }
    }
    
    // 3) Delete the organization document
    await deleteDoc(orgRef);
    
    console.log('[deleteOrganization] Organization deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[deleteOrganization] Error deleting organization:', error);
    throw error;
  }
}

// Update school
export async function updateSchool({
  schoolId,
  adminUserId,
  organizationId,
  name,
  location,
  email,
  phone,
  adminName
}) {
  console.log('[updateSchool] Starting school update...', schoolId);
  
  try {
    let schoolRef;
    
    if (organizationId) {
      schoolRef = doc(db, `users/${adminUserId}/organizations/${organizationId}/schools`, schoolId);
    } else {
      schoolRef = doc(db, `users/${adminUserId}/schools`, schoolId);
    }
    
    await updateDoc(schoolRef, {
      name,
      location,
      email,
      phone,
      adminName,
      updatedAt: serverTimestamp()
    });
    
    console.log('[updateSchool] School updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[updateSchool] Error updating school:', error);
    throw error;
  }
}

// Delete school
export async function deleteSchool({
  schoolId,
  adminUserId,
  organizationId
}) {
  console.log('[deleteSchool] Starting school deletion...', schoolId);
  
  try {
    let schoolPath;
    let schoolRef;
    
    if (organizationId) {
      schoolPath = `users/${adminUserId}/organizations/${organizationId}/schools`;
      schoolRef = doc(db, schoolPath, schoolId);
    } else {
      schoolPath = `users/${adminUserId}/schools`;
      schoolRef = doc(db, schoolPath, schoolId);
    }
    
    // Get school data to delete user document
    const schoolSnap = await getDoc(schoolRef);
    
    if (schoolSnap.exists()) {
      const schoolData = schoolSnap.data();
      
      // Delete school's subcollections
      await deleteSchoolSubcollections(schoolPath, schoolId);
      
      // Delete school's user document if it exists
      if (schoolData.schoolUserId) {
        await deleteDoc(doc(db, 'users', schoolData.schoolUserId));
      }
    }
    
    // Delete the school document
    await deleteDoc(schoolRef);
    
    console.log('[deleteSchool] School deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[deleteSchool] Error deleting school:', error);
    throw error;
  }
}

// Helper function to delete school subcollections
async function deleteSchoolSubcollections(schoolPath, schoolId) {
  const subcollections = ['students', 'teachers', 'assignments', 'grades'];
  
  for (const subcollection of subcollections) {
    const collectionPath = `${schoolPath}/${schoolId}/${subcollection}`;
    const snapshot = await getDocs(collection(db, collectionPath));
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, collectionPath, docSnapshot.id));
    }
  }
}
