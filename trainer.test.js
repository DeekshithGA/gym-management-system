// trainer.test.js
import {
  getAssignedMembers,
  logSession,
  suggestRoutine,
  scheduleSession,
  getScheduledSessions,
  updateSessionStatus,
  getMemberProgressReports,
  setTrainerAvailability,
  getTrainerWorkload,
} from './trainer.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('Trainer Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAssignedMembers returns members array', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { id: 'm1', data: () => ({ name: 'Member One' }) },
        { id: 'm2', data: () => ({ name: 'Member Two' }) },
      ],
    });

    const members = await getAssignedMembers('trainer123');
    expect(members.length).toBe(2);
    expect(members[0]).toHaveProperty('name', 'Member One');
  });

  test('logSession calls addDoc with session data', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    const sessionDetails = { date: '2025-08-26', durationMinutes: 60, exercises: [], notes: 'Good session' };
    await logSession('member123', 'trainer123', sessionDetails);

    expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      memberId: 'member123',
      trainerId: 'trainer123',
      sessionDetails,
    }));
  });

  test('suggestRoutine creates a routine for member', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    const routineData = { name: 'Weight Loss', exercises: [] };
    await suggestRoutine('member123', routineData);

    expect(addDoc).toHaveBeenCalled();
  });

  test('scheduleSession adds new session', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await scheduleSession('trainer123', 'member123', '2025-09-01T10:00:00Z', 'personal');

    expect(addDoc).toHaveBeenCalled();
  });

  test('getScheduledSessions retrieves sessions in range', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { id: 's1', data: () => ({ sessionType: 'personal' }) },
        { id: 's2', data: () => ({ sessionType: 'class' }) },
      ],
    });

    const sessions = await getScheduledSessions('trainer123', '2025-08-01', '2025-08-31');
    expect(sessions.length).toBe(2);
  });

  test('updateSessionStatus updates session status', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    updateDoc.mockResolvedValue();

    await updateSessionStatus('session123', 'completed');

    expect(updateDoc).toHaveBeenCalledWith('docRef', { status: 'completed' });
  });

  test('getMemberProgressReports fetches progress logs', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [{ data: () => ({ weightKg: 70 }) }, { data: () => ({ weightKg: 68 }) }],
    });

    const reports = await getMemberProgressReports('member123');
    expect(reports.length).toBe(2);
  });

  test('setTrainerAvailability updates availability data', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    updateDoc.mockResolvedValue();

    const availability = [{ day: 'Monday', from: '09:00', to: '12:00' }];
    await setTrainerAvailability('trainer123', availability);

    expect(updateDoc).toHaveBeenCalledWith('docRef', expect.objectContaining({ availability }));
  });

  test('getTrainerWorkload returns upcoming sessions count', async () => {
    const getScheduledSessions = require('./trainer.js').getScheduledSessions;
    getScheduledSessions.mockResolvedValue(new Array(3));

    const workload = await getTrainerWorkload('trainer123');
    expect(workload.upcomingSessions).toBe(3);
  });
});
