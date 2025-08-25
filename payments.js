import { db } from './firebase-config.js';
import { collection, addDoc, updateDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Create a payment record (called after payment gateway confirms)
export async function createPaymentRecord(memberId, amount, currency = 'USD', paymentMethod = 'card', status = 'pending', description = '') {
  try {
    const paymentData = {
      memberId,
      amount,
      currency,
      paymentMethod,
      status, // 'pending', 'success', 'failed'
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'payments'), paymentData);
    logEvent('Payment record created', { paymentId: docRef.id, memberId, amount, status });
    return docRef.id;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
}

// Update payment status (e.g., after confirmation or refund)
export async function updatePaymentStatus(paymentId, status, updateInfo = {}) {
  try {
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, { status, updatedAt: new Date().toISOString(), ...updateInfo });
    logEvent('Payment status updated', { paymentId, status });
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
}

// Get all payments for a member
export async function getPaymentsForMember(memberId) {
  try {
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));
    const payments = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return payments.filter(p => p.memberId === memberId);
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

// Send payment reminder (placeholder logic)
export async function sendPaymentReminder(memberId, message) {
  // In real implementation, integrate with notifications.js or email API
  alert(`Reminder sent to member ${memberId}: ${message}`);
  logEvent('Payment reminder sent', { memberId, message });
}

// Generate CSV report of payments in a date range
export async function generatePaymentsReport(startDate, endDate) {
  try {
    const paymentsSnapshot = await getDocs(collection(db, 'payments'));
    const payments = paymentsSnapshot.docs.map(doc => doc.data()).filter(p => {
      return p.createdAt >= startDate && p.createdAt <= endDate;
    });
    let csv = 'Member ID,Amount,Currency,Payment Method,Status,Date\n';
    payments.forEach(p => {
      csv += `${p.memberId},${p.amount},${p.currency},${p.paymentMethod},${p.status},${p.createdAt}\n`;
    });
    return csv;
  } catch (error) {
    console.error('Error generating payments report:', error);
    throw error;
  }
}

// Placeholder for refund a payment
export async function refundPayment(paymentId, refundAmount, reason) {
  try {
    // Ideally integrate payment gateway refund API here
    
    await updatePaymentStatus(paymentId, 'refunded', { refundAmount, refundReason: reason, refundedAt: new Date().toISOString() });
    logEvent('Payment refunded', { paymentId, refundAmount, reason });
  } catch (error) {
    console.error('Refund payment error:', error);
    throw error;
  }
}

// Create an invoice (placeholder for integration with PDF generator or external service)
export async function createInvoice(paymentId) {
  try {
    // Fetch payment details...
    // generate PDF or structured invoice here
    logEvent('Invoice generated', { paymentId });
  } catch (error) {
    console.error('Invoice generation error:', error);
  }
}

// Setup recurring subscription (placeholder)
export async function setupSubscription(memberId, planId, price, interval) {
  try {
    // Integrate subscription via payment gateway
    logEvent('Subscription setup', { memberId, planId, price, interval });
  } catch (error) {
    console.error('Setup subscription error:', error);
  }
}
