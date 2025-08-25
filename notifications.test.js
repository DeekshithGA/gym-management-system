// notification.test.js
import {
  sendNotification,
  getNotificationsForMember,
  markNotificationRead,
  sendBulkNotification,
} from './notifications.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('Notification Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sendNotification calls addDoc with correct data', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await sendNotification('member123', 'Test message');

    expect(addDoc).toHaveBeenCalledTimes(1);
    const callArgs = addDoc.mock.calls[0];
    expect(callArgs[1]).toMatchObject({ memberId: 'member123', message: 'Test message' });
  });

  test('getNotificationsForMember returns notifications array', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ message: 'Notification 1', read: false }) },
        { data: () => ({ message: 'Notification 2', read: true }) },
      ],
    });

    const notifications = await getNotificationsForMember('member123');
    expect(notifications.length).toBe(2);
    expect(notifications[0]).toHaveProperty('message');
  });

  test('markNotificationRead updates notification read status', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    updateDoc.mockResolvedValue();

    await markNotificationRead('notificationId123');

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  test('sendBulkNotification sends notification to multiple members', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    const memberIds = ['member1', 'member2', 'member3'];
    await sendBulkNotification(memberIds, 'Bulk announcement');

    expect(addDoc).toHaveBeenCalledTimes(3);
  });
});
