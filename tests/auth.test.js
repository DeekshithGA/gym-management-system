// auth.test.js
import { auth, googleProvider } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { logEvent } from './logging.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

describe('Authentication Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('signInWithEmailAndPassword called with correct arguments', async () => {
    const email = 'test@example.com';
    const password = 'Password123';
    signInWithEmailAndPassword.mockResolvedValue({ user: { email } });

    const authModule = require('./auth.js');
    await authModule.signInWithEmailAndPassword(auth, email, password);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
  });

  test('signInWithEmailAndPassword failure is handled', async () => {
    const errorMessage = 'Invalid credentials';
    signInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));

    try {
      await require('./auth.js').signInWithEmailAndPassword(auth, 'fail@example.com', 'wrongpass');
    } catch (e) {
      expect(e.message).toBe(errorMessage);
    }
  });

  test('Google sign-in with popup calls signInWithPopup', async () => {
    signInWithPopup.mockResolvedValue({ user: { email: 'googleuser@example.com' } });

    const authModule = require('./auth.js');
    await authModule.signInWithPopup(auth, googleProvider);

    expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
  });

  test('Password reset sends email', async () => {
    sendPasswordResetEmail.mockResolvedValue();

    const email = 'reset@example.com';
    await require('./auth.js').sendPasswordResetEmail(auth, email);

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, email);
  });

  test('signOut calls Firebase signOut function', async () => {
    signOut.mockResolvedValue();

    await require('./auth.js').signOut(auth);

    expect(signOut).toHaveBeenCalledWith(auth);
  });
});
