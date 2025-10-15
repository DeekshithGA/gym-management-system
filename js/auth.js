import { auth, googleProvider } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { logEvent } from './logging.js';

const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role-selector').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    logEvent('User Logged In', { email, role });
    // Role-based redirect example
    if (role === 'admin') window.location.href = 'admin.html';
    else if (role === 'trainer') window.location.href = 'trainer.html';
    else window.location.href = 'member.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
    logEvent('Login Failed', { email, error: error.message });
  }
});

document.getElementById('google-login').addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    logEvent('Google Login Success', { email: result.user.email });
    window.location.href = 'member.html';
  } catch (error) {
    alert('Google Login failed: ' + error.message);
    logEvent('Google Login Failed', { error: error.message });
  }
});

document.getElementById('resetPasswordBtn').addEventListener('click', () => {
  const email = prompt('Please enter your email for password reset:');
  if (email) {
    sendPasswordResetEmail(auth, email)
      .then(() => alert("Password reset email sent"))
      .catch(err => alert("Reset failed: " + err.message));
  }
});

// Auto sign-out inactive users after 15 minutes
let inactivityTimeout;
function resetInactivityTimer() {
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    signOut(auth).then(() => alert("You have been signed out due to inactivity."));
  }, 15 * 60 * 1000);
}
window.onload = resetInactivityTimer;
window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('keypress', resetInactivityTimer);
