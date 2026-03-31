import React, { useState, useEffect, useCallback, createContext, useContext } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase"; // your Firebase config
import { useToast } from "@/hooks/use-toast";
import { ExtendedUser } from "@/types/auth";

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = useCallback(
    async (firebaseUser: User) => {
      try {
        // Read role from users collection (matches Firestore security rules)
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.exists() ? userDocSnap.data() : null;

        console.log('[useAuth] User UID:', firebaseUser.uid);
        console.log('[useAuth] Users collection data:', userData);
        console.log('[useAuth] Role from users collection:', userData?.role);

        // Optionally read demographics for additional profile info (don't fail if this errors)
        let demographics = null;
        try {
          const demographicsRef = doc(db, "demographics", firebaseUser.uid);
          const demographicsSnap = await getDoc(demographicsRef);
          demographics = demographicsSnap.exists() ? demographicsSnap.data() : null;
          console.log('[useAuth] Demographics data:', demographics);
        } catch (demoError: any) {
          console.warn('[useAuth] Could not read demographics (non-critical):', demoError.message);
        }

        // Determine the user's role from users collection, with fallback to demographics, defaulting to 'student' if not specified
        const userRole = userData?.role || demographics?.role || "student";

        console.log('[useAuth] Final role:', userRole);

        // Warn if role is only in demographics (should be migrated to users collection)
        if (!userData?.role && demographics?.role) {
          console.warn('[useAuth] Role found in demographics but not in users collection. Please migrate role to users/{uid}');
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          role: userRole,
          name: userData?.name || demographics?.name,
          demographics,
          user_metadata: {
            isAdmin: userRole === 'admin',
            role: userRole,
          },
        });
      } catch (e: any) {
        console.error('[useAuth] Error fetching user data:', e);
        setError(e.message || "Failed to fetch user data");
        toast({
          title: "User Data Error",
          description: e.message || "Failed to fetch user data",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
