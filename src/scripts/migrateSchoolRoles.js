// Migration script to update school roles from "school" to "management"
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';

// Your Firebase config (copy from firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyDXHExmPAJ_NxHQ0yofSCbFvccz5YeNEQE",
  authDomain: "projectnovo-1.firebaseapp.com",
  projectId: "projectnovo-1",
  storageBucket: "projectnovo-1.firebasestorage.app",
  messagingSenderId: "1074304461990",
  appId: "1:1074304461990:web:0e0d2c0b4e9c7b8a9e8b9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateSchoolRoles() {
  console.log('Starting migration: school -> management role...');
  
  try {
    // Query all users with role "school"
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'school'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} users with role "school"`);
    
    let updated = 0;
    for (const docSnap of querySnapshot.docs) {
      const userId = docSnap.id;
      const userData = docSnap.data();
      
      console.log(`Updating user ${userId} (${userData.email})...`);
      
      // Update role to "management"
      await updateDoc(doc(db, 'users', userId), {
        role: 'management'
      });
      
      updated++;
      console.log(`✓ Updated ${userId}`);
    }
    
    console.log(`\n✅ Migration complete! Updated ${updated} users.`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateSchoolRoles();
