import { db } from './firebase-config.js';
import { 
  collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, setDoc 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

const GYM_START_HOUR = 6; // Gym starts at 6 AM

// Record member attendance check-in or check-out
export async function recordCheck(memberId, type = 'check-in', datetime = new Date()) {
  const dateStr = datetime.toISOString().split('T')[0];
  const docId = `${memberId}_${dateStr}`;
  try {
    const attRef = doc(db, "attendance", docId);
    const attSnap = await getDoc(attRef);
    let data = attSnap.exists() ? attSnap.data() : { memberId, date: dateStr };

    if (type === 'check-in') {
      data.checkInTime = datetime.toISOString();
      const hr = datetime.getHours(), min = datetime.getMinutes();
      data.lateArrival = hr > GYM_START_HOUR || (hr === GYM_START_HOUR && min > 15);
    } else if (type === 'check-out') {
      data.checkOutTime = datetime.toISOString();
    }
    data.lastUpdated = new Date().toISOString();

    await setDoc(attRef, data);
    logEvent("Attendance check recorded", { memberId, type, datetime });
  } catch (error) {
    console.error('Failed recording attendance:', error);
    throw error;
  }
}

// Request attendance correction with reason
export async function requestCorrection(memberId, dateStr, reason) {
  try {
    await addDoc(collection(db, "attendanceCorrections"), {
      memberId,
      date: dateStr,
      reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    logEvent("Attendance correction requested", { memberId, dateStr, reason });
  } catch (err) {
    console.error('Correction request error:', err);
    throw err;
  }
}

// Admin approves or rejects attendance correction
export async function handleCorrectionRequest(correctionId, approve, adminId) {
  try {
    const correctionRef = doc(db, "attendanceCorrections", correctionId);
    const correctionSnap = await getDoc(correctionRef);
    const corrData = correctionSnap.data();

    await updateDoc(correctionRef, {
      status: approve ? 'approved' : 'denied',
      handledBy: adminId,
      handledAt: new Date().toISOString()
    });

    if (approve) {
      const attRef = doc(db, "attendance", `${corrData.memberId}_${corrData.date}`);
      await updateDoc(attRef, { status: 'present-corrected' });
    }
    logEvent("Correction handled", { correctionId, approve, adminId });
  } catch (err) {
    console.error('Failed handling correction request:', err);
    throw err;
  }
}

// Fetch attendance records for member between dates
export async function getAttendanceRecords(memberId, startDate, endDate) {
  try {
    const attendanceQuery = query(
      collection(db, "attendance"),
      where("memberId", "==", memberId),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const snapshot = await getDocs(attendanceQuery);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    throw err;
  }
}

// Generate attendance CSV report for a month
export async function generateMonthlyReport(memberId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  const records = await getAttendanceRecords(memberId, startDate, endDate);
  let csv = "Date,CheckIn,CheckOut,LateArrival,Status\n";
  records.forEach(r => {
    csv += `${r.date},${r.checkInTime || ''},${r.checkOutTime || ''},${r.lateArrival ? 'Yes' : 'No'},${r.status || ''}\n`;
  });
  return csv;
}

// Award badges when attendance streak milestones met
export async function awardAttendanceBadges(memberId) {
  const milestones = [5, 10, 20, 30];
  const summary = await getAttendanceSummary(memberId);
  for (const m of milestones) {
    if (summary.currentStreak >= m) {
      await addDoc(collection(db, "badges"), {
        memberId,
        badgeName: `Attendance Streak: ${m} Days`,
        awardedAt: new Date().toISOString()
      });
      logEvent("Attendance badge awarded", { memberId, milestone: m });
    }
  }
}

// Bulk update attendance for members on a date by admin
export async function bulkUpdateAttendance(dateStr, memberIds, status = 'present') {
  for (const memberId of memberIds) {
    const docId = `${memberId}_${dateStr}`;
    await setDoc(doc(db, "attendance", docId), {
      memberId,
      date: dateStr,
      status,
      lastUpdated: new Date().toISOString()
    });
  }
  logEvent("Bulk attendance updated", { dateStr, memberIds, status });
}

// Notify admins/members if successive absences exceed threshold
export async function notifyAbsentMembers(daysThreshold = 3) {
  const today = new Date();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(today.getDate() - daysThreshold);

  const snapshot = await getDocs(collection(db, "members"));
  const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  for (const member of members) {
    const attendanceRecords = await getAttendanceRecords(member.id, cutoffDate.toISOString().split('T')[0], today.toISOString().split('T')[0]);
    const allAbsent = attendanceRecords.length >= daysThreshold && attendanceRecords.every(r => r.status === 'absent' || !r.status);
    if (allAbsent) {
      // Implement notification logic here
      alert(`Member ${member.id} absent for ${daysThreshold} consecutive days!`);
      logEvent("Absent member notification", { memberId: member.id, daysThreshold });
    }
  }
}

// Get attendance summary (present, absent count, current streak)
export async function getAttendanceSummary(memberId) {
  try {
    const snapshot = await getDocs(query(collection(db, "attendance"), where("memberId", "==", memberId)));
    const records = snapshot.docs.map(doc => doc.data());

    let present = 0, absent = 0;
    const sortedRecords = records.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedRecords.forEach(r => {
      if (r.status === 'present' || r.status === 'present-corrected') present++;
      else if (r.status === 'absent') absent++;
    });

    // Calculate current streak (consecutive presents until today)
    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = sortedRecords.length -1; i>=0; i--) {
      const rec = sortedRecords[i];
      if ((rec.status === 'present' || rec.status === 'present-corrected') && rec.date <= todayStr) streak++;
      else break;
    }

    return { present, absent, currentStreak: streak };
  } catch (err) {
    console.error("Error getting attendance summary:", err);
    return { present: 0, absent: 0, currentStreak: 0 };
  }
}
