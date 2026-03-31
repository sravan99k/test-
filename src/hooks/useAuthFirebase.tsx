import { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut, getIdToken, updateProfile } from 'firebase/auth';
import { auth } from '@/integrations/firebase';

interface ExtendedUser extends User {
  role?: 'student' | 'management' | 'teacher';
  demographics?: any;
}

export function useAuthFirebase() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user role and demographics from your backend/database here
  const fetchUserMetadata = useCallback(async (firebaseUser: User) => {
    // Fetch role from users collection and demographics from demographics collection
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const { db } = await import("@/integrations/firebase");
      
      // Read role from users collection (matches Firestore security rules)
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.exists() ? userDocSnap.data() : null;
      
      // Optionally read demographics for additional profile info
      const demographicsRef = doc(db, "demographics", firebaseUser.uid);
      const demographicsSnap = await getDoc(demographicsRef);
      const demographics = demographicsSnap.exists() ? demographicsSnap.data() : null;
      
      return {
        role: userData?.role || "student",
        demographics,
      };
    } catch (e) {
      return {
        role: "student",
        demographics: {},
      };
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const metadata = await fetchUserMetadata(firebaseUser);
          setUser({ ...firebaseUser, ...metadata });
        } catch (err: any) {
          setError('Failed to fetch user metadata');
          setUser({ ...firebaseUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserMetadata]);

  const logout = useCallback(() => signOut(auth), []);

  return {
    user,
    loading,
    error,
    logout,
    // Add more Firebase auth helpers as needed
  };
}
