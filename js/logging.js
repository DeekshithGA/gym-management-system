export function logEvent(event, data) {
  console.log(`[LOG][${new Date().toISOString()}] ${event}`, data);
  // Optionally send to Firestore for centralized logging
  // For real app, analyze logs to alert admins on suspicious patterns
}
