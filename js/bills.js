import { db } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from "./logging.js";

// Create bill
export async function createBill(bill) {
  await addDoc(collection(db, "bills"), bill);
  logEvent("Bill Created", bill);
}

// Download bill as PDF (using jsPDF)
// Placeholder function, implement using jsPDF library
export function exportBillAsPdf(bill) {
  alert("PDF bill generation feature coming soon.");
}

// Create installment plan
export async function createInstallmentPlan(memberId, plan) {
  await addDoc(collection(db, "installments"), { memberId, ...plan });
  logEvent("Installment Plan Created", { memberId, plan });
}
