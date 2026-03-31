import { auth, db } from "../integrations/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export function getRedirectPathForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "organization":
      return "/organization";
    case "school":
      return "/school";
    case "teacher":
      return "/teacher";
    case "student":
      return "/student";
    default:
      return "/";
  }
}

export async function getUserRole(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data?.role || null;
}

export async function login({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const role = await getUserRole(uid);
  const path = getRedirectPathForRole(role);
  return { user: cred.user, role, redirectPath: path };
}

export async function logout() {
  await signOut(auth);
}

// Helper used by admin flows to create an Auth user + /users document
// profileCollection: one of "organizations" | "schools" | "teachers" | "students"
export async function createUserWithProfile({
  email,
  password,
  displayName,
  role,
  profileCollection,
  profileId, // the created profile document id
}) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  const uid = cred.user.uid;
  const usersRef = doc(db, "users", uid);
  await setDoc(usersRef, {
    email,
    role,
    profileId: doc(db, profileCollection, profileId),
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: "active",
  });
  return cred.user;
}
