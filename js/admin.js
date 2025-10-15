import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Add member
export async function addMember(member) {
  try {
    await addDoc(collection(db, "members"), member);
    logEvent("Member Added", member);
  } catch (err) {
    alert("Add member failed: " + err.message);
  }
}

// Bulk import members from CSV (using Papaparse or similar outside scope here)
export async function bulkImportMembers(membersArray) {
  for (const member of membersArray) {
    await addMember(member);
  }
  alert(`${membersArray.length} Members imported successfully.`);
}

// Export members as CSV
export async function bulkExportMembers() {
  const members = await getMembers();
  let csv = "id,name,email\n";
  members.forEach(m => {
    csv += `${m.id},${m.name},${m.email}\n`;
  });
  // Offer download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "members.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// Ban a user
export async function banUser(uid, reason) {
  await updateDoc(doc(db, "members", uid), { banned: true, banReason: reason });
  logEvent("User banned", { uid, reason });
  alert("User banned successfully.");
}

// Push message to all members
export async function sendMessageToAll(message) {
  // Simplified: Add to notifications collection for all users, in real app use messaging API
  const members = await getMembers();
  for (const m of members) {
    await addDoc(collection(db, "notifications"), {
      memberId: m.id,
      message,
      timestamp: new Date()
    });
  }
  alert("Message sent to all members.");
}

// Example dashboard stat: total members
export async function getTotalMembers() {
  const snapshot = await getDocs(collection(db, "members"));
  document.getElementById('total-members').textContent = snapshot.size;
}
