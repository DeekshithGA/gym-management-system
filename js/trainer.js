import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Get members assigned to a trainer
export async function getAssignedMembers(trainerId) {
  try {
    const membersQuery = query(collection(db, "members"), where("trainerId", "==", trainerId));
    const snapshot = await getDocs(membersQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error getting assigned members:', err);
    return [];
  }
}

// Log a training session for a member
export async function logSession(memberId, trainerId, sessionDetails) {
  // sessionDetails example: { date, durationMinutes, exercises, notes }
  try {
    await addDoc(collection(db, "trainingSessions"), {
      memberId,
      trainerId,
      sessionDetails,
      loggedAt: new Date().toISOString()
    });
    logEvent('Training session logged', { memberId, trainerId, sessionDetails });
  } catch (err) {
    console.error('Error logging session:', err);
  }
}

// Suggest a personalized workout routine for member
export async function suggestRoutine(memberId, routineData) {
  // routineData example: { name, exercises: [{name, sets, reps, rest}], notes }
  try {
    await addDoc(collection(db, "routines"), {
      memberId,
      routineData,
      suggestedAt: new Date().toISOString()
    });
    logEvent('Routine suggested', { memberId, routineData });
  } catch (err) {
    console.error('Error suggesting routine:', err);
  }
}

// Schedule a training session or class
export async function scheduleSession(trainerId, memberId, datetime, sessionType = 'personal') {
  // sessionType: 'personal' or 'class'
  try {
    await addDoc(collection(db, "sessionSchedules"), {
      trainerId,
      memberId,
      datetime,
      sessionType,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    });
    logEvent('Session scheduled', { trainerId, memberId, datetime, sessionType });
  } catch (err) {
    console.error('Error scheduling session:', err);
  }
}

// Get a trainer's scheduled sessions in a date range
export async function getScheduledSessions(trainerId, startDate, endDate) {
  try {
    const q = query(collection(db, "sessionSchedules"), 
                    where("trainerId", "==", trainerId),
                    where("datetime", ">=", startDate),
                    where("datetime", "<=", endDate));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching scheduled sessions:', err);
    return [];
  }
}

// Update session status (e.g., completed, canceled)
export async function updateSessionStatus(sessionId, status) {
  try {
    await updateDoc(doc(db, "sessionSchedules", sessionId), { status });
    logEvent('Session status updated', { sessionId, status });
  } catch (err) {
    console.error('Error updating session status:', err);
  }
}

// Get progress reports for assigned member
export async function getMemberProgressReports(memberId) {
  try {
    const q = query(collection(db, "progressLogs"), where("memberId", "==", memberId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Error getting progress reports:', err);
    return [];
  }
}

// Manage availability for trainer (array of available time slots)
export async function setTrainerAvailability(trainerId, availability) {
  // availability example: [{ day: 'Monday', from: '08:00', to: '12:00' }, ...]
  try {
    await updateDoc(doc(db, "trainers", trainerId), { availability, updatedAt: new Date().toISOString() });
    logEvent('Trainer availability updated', { trainerId, availability });
  } catch (err) {
    console.error('Error setting availability:', err);
  }
}

// Get trainer workload summary (number of sessions in next week, etc)
export async function getTrainerWorkload(trainerId) {
  const now = new Date();
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);
  try {
    const sessions = await getScheduledSessions(trainerId, now.toISOString(), oneWeekLater.toISOString());
    return { upcomingSessions: sessions.length };
  } catch (err) {
    console.error('Error getting workload:', err);
    return { upcomingSessions: 0 };
  }
}
