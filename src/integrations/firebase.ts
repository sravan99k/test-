// Firebase initialization and export
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
 

// TODO: Replace with your Firebase project config
// Import the functions you need from the SDKs you need

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXHExmPAJ_NxHQ0yofSCbFvccz5YeNEQE",
  authDomain: "projectnovo-1.firebaseapp.com",
  projectId: "projectnovo-1",
  storageBucket: "projectnovo-1.appspot.com",
  messagingSenderId: "666273158773",
  appId: "1:666273158773:web:aa65a349f5898e07a88a3c",
  measurementId: "G-5GVDTK3WGM"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to submit feedback
const submitFeedback = async (feedbackData: {
  name: string;
  email: string;
  message: string;
  rating: number;
  pageUrl?: string;
}) => {
  try {
    const feedbackRef = collection(db, 'feedback');
    const docRef = await addDoc(feedbackRef, {
      ...feedbackData,
      createdAt: serverTimestamp(),
      status: 'new',
      userId: auth.currentUser?.uid || 'anonymous',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting feedback: ", error);
    return { success: false, error };
  }
};

export { app, auth, db, submitFeedback };
