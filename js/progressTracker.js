import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

/**
 * Log progress entry for a user
 * @param {string} memberId - Firestore member ID
 * @param {Object} progressData - { date, weightKg, bmi, bodyFatPct, muscleMassKg, notes }
 */
export async function logProgress(memberId, progressData) {
  try {
    const data = {
      memberId,
      date: progressData.date || new Date().toISOString().split('T')[0],
      weightKg: progressData.weightKg || null,
      bmi: progressData.bmi || null,
      bodyFatPct: progressData.bodyFatPct || null,
      muscleMassKg: progressData.muscleMassKg || null,
      notes: progressData.notes || '',
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'progressLogs'), data);
    logEvent("Progress logged", { memberId, data });
  } catch (err) {
    console.error("Error logging progress:", err);
  }
}

/**
 * Fetch progress logs for a member between two dates
 * @param {string} memberId 
 * @param {string} startDate - e.g. '2025-01-01'
 * @param {string} endDate
 * @returns {Array} Array of progress objects sorted by date asc
 */
export async function getProgressLogs(memberId, startDate, endDate) {
  try {
    const progressQuery = query(
      collection(db, 'progressLogs'),
      where('memberId', '==', memberId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const snapshot = await getDocs(progressQuery);
    const logs = snapshot.docs.map(doc => doc.data());
    return logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (err) {
    console.error("Error fetching progress logs:", err);
    return [];
  }
}

/**
 * Calculate progress trends such as weight change, BMI trends etc.
 * @param {Array} logs Array of progress logs sorted by date ascending
 * @returns {Object} trend summaries
 */
export function calculateTrends(logs) {
  if (logs.length < 2) return { message: "Not enough data for trends." };

  const first = logs[0];
  const last = logs[logs.length - 1];
  const weightChange = last.weightKg - first.weightKg;
  const bmiChange = last.bmi - first.bmi;

  return {
    weightChange, // positive or negative value
    bmiChange,
    firstDate: first.date,
    lastDate: last.date,
    entriesCount: logs.length
  };
}

/**
 * Generate simple ASCII progress bar for terminal or UI visualization
 * @param {number} percent 0-100 progress percentage
 * @param {number} length ASCII bar length default 20 chars
 */
export function generateProgressBar(percent, length = 20) {
  const filledLength = Math.round((percent / 100) * length);
  return '[' + '#'.repeat(filledLength) + '-'.repeat(length - filledLength) + `] ${percent}%`;
}

/**
 * Export progress logs to CSV format for download or sharing
 * @param {Array} logs - Array of progress logs
 */
export function exportProgressCSV(logs) {
  let csv = 'Date,Weight (kg),BMI,Body Fat %,Muscle Mass (kg),Notes\n';
  logs.forEach(log => {
    csv += `${log.date},${log.weightKg || ''},${log.bmi || ''},${log.bodyFatPct || ''},${log.muscleMassKg || ''},"${log.notes || ''}"\n`;
  });
  return csv;
}

/**
 * Validate the progress data before logging
 * @param {Object} data 
 * @returns {boolean|string} true if valid, else error message
 */
export function validateProgressData(data) {
  if (!data.weightKg && !data.bmi && !data.bodyFatPct && !data.muscleMassKg) {
    return "At least one measurement must be provided";
  }
  if (data.weightKg && (data.weightKg <= 0 || data.weightKg > 500)) return "Weight must be between 0 and 500 kg";
  if (data.bmi && (data.bmi <= 0 || data.bmi > 100)) return "BMI must be between 0 and 100";
  if (data.bodyFatPct && (data.bodyFatPct < 0 || data.bodyFatPct > 100)) return "Body Fat % must be between 0 and 100";
  if (data.muscleMassKg && (data.muscleMassKg < 0 || data.muscleMassKg > 200)) return "Muscle Mass must be valid kg value";
  return true;
}
