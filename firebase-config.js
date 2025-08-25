// Import required Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { getRemoteConfig, fetchAndActivate, getValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-remote-config.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getPerformance } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-performance.js";
import { getCrashlytics, recordError } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-crashlytics.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging.js";

// Firebase config object - replace with your project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Auth Setup with multiple providers
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const emailProvider = EmailAuthProvider; // For email-password credential creation if needed

// Firestore Database
const db = getFirestore(app);

// Storage for media files (profile pics, receipts, supplements images, etc.)
const storage = getStorage(app);

// Remote Config - to enable dynamic config / feature flags
const remoteConfig = getRemoteConfig(app);
remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour default
};
fetchAndActivate(remoteConfig)
  .then(() => {
    console.log('Remote config values fetched and activated');
  })
  .catch((err) => {
    console.warn('Remote config fetch failed', err);
  });

// Analytics to track user engagement
const analytics = getAnalytics(app);

// Performance monitoring to gauge app efficiency;
const performance = getPerformance(app);

// Crashlytics for runtime error reporting
const crashlytics = getCrashlytics(app);

// Cloud Messaging for push notifications (web supported browsers only)
const messaging = getMessaging(app);

// Export all initialized services and providers for app use
export {
  app,
  auth,
  googleProvider,
  facebookProvider,
  emailProvider,
  db,
  storage,
  remoteConfig,
  getValue,
  analytics,
  logEvent,
  performance,
  crashlytics,
  recordError,
  messaging
};
