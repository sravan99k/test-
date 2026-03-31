import { app, db } from "../integrations/firebase";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

function getSecondaryAuth() {
  const name = "SecondaryApp";
  const secondary = getApps().find((a) => a.name === name) || initializeApp(app.options, name);
  return getAuth(secondary);
}

export async function addStudent({
  firstName,
  lastName,
  email,
  password,
  phone,
  grade,
  section,
  dateOfBirth,
  gender,
  address,
  parentName,
  parentPhone,
  schoolId,
}) {
  const studentRef = await addDoc(collection(db, "students"), {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    parentName,
    parentPhone,
    schoolId: doc(db, "schools", schoolId),
    grade: grade ?? null,
    section: section ?? null,
    status: "active",
    createdAt: serverTimestamp(),
  });

  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role: "student",
    profileId: doc(db, "students", studentRef.id),
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: "active",
  });

  console.log("Student created:", studentRef.id);
  return { studentId: studentRef.id, userId: cred.user.uid };
}

export async function addTeacher({
  firstName,
  lastName,
  email,
  password,
  phone,
  dateOfBirth,
  gender,
  address,
  schoolId,
}) {
  const teacherRef = await addDoc(collection(db, "teachers"), {
    firstName,
    lastName,
    email,
    phone,
    dateOfBirth,
    gender,
    address,
    schoolId: doc(db, "schools", schoolId),
    assignedClasses: [],
    status: "active",
    createdAt: serverTimestamp(),
  });

  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);

  await setDoc(doc(db, "users", cred.user.uid), {
    email,
    role: "teacher",
    profileId: doc(db, "teachers", teacherRef.id),
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    status: "active",
  });

  console.log("Teacher created:", teacherRef.id);
  return { teacherId: teacherRef.id, userId: cred.user.uid };
}

export async function addClass({
  grade,
  section, // optional
  schoolId,
  teacherId, // optional
  academicYear, // optional string, e.g. "2025-2026"
}) {
  const classRef = await addDoc(collection(db, "classes"), {
    grade,
    section: section ?? null,
    schoolId: doc(db, "schools", schoolId),
    teacherId: teacherId ? doc(db, "teachers", teacherId) : null,
    academicYear: academicYear ?? null,
    createdAt: serverTimestamp(),
  });

  if (teacherId) {
    await updateDoc(doc(db, "teachers", teacherId), {
      assignedClasses: arrayUnion(classRef.id),
    });
  }

  console.log("Class created:", classRef.id);
  return { classId: classRef.id };
}

export async function assignTeacherToClass({ teacherId, classId }) {
  await updateDoc(doc(db, "classes", classId), {
    teacherId: doc(db, "teachers", teacherId),
  });
  await updateDoc(doc(db, "teachers", teacherId), {
    assignedClasses: arrayUnion(classId),
  });
  console.log("Assigned teacher", teacherId, "to class", classId);
}

export async function addAssignment({
  title,
  description,
  dueDate, // Date or timestamp number
  classId,
  teacherId,
  status = "draft",
}) {
  const assignmentRef = await addDoc(collection(db, "assignments"), {
    title,
    description,
    dueDate,
    classId: doc(db, "classes", classId),
    teacherId: doc(db, "teachers", teacherId),
    status,
    createdAt: serverTimestamp(),
  });
  console.log("Assignment created:", assignmentRef.id);
  return { assignmentId: assignmentRef.id };
}
