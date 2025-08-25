import { db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Log workout progress
export async function logWorkout(memberId, data) {
  await addDoc(collection(db, "workouts"), {
    memberId,
    ...data,
    date: new Date()
  });
  logEvent("Workout Logged", { memberId, data });
}

// Get attendance history
export async function getAttendance(memberId) {
  const q = query(collection(db, "attendance"), where("memberId", "==", memberId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}

// Award achievement badge
export async function awardBadge(memberId, badgeName) {
  await addDoc(collection(db, "badges"), {
    memberId,
    badgeName,
    dateAwarded: new Date()
  });
  logEvent("Badge Awarded", { memberId, badgeName });
}
