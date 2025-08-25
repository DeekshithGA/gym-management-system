import { db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Send notification
export async function sendNotification(message, memberId) {
  await addDoc(collection(db, "notifications"), { memberId, message, read: false, timestamp: new Date() });
  logEvent("Notification Sent", { memberId, message });
}

// Mark notification as read
export async function markNotificationRead(notificationId) {
  const notifRef = doc(db, "notifications", notificationId);
  await updateDoc(notifRef, { read: true });
}

// Get scheduled notifications (coming soon)
export async function getScheduledNotifications() {
  alert("Scheduled notifications feature coming soon!");
}
