// admin.test.js
import { addMember, updateMember, getMembers, sendNotificationToAll } from './admin.js';
import { db } from './firebase-config.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn()
}));

describe('Admin Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('addMember should call Firestore addDoc with correct data', async () => {
    const mockAddDoc = require('firebase/firestore').addDoc;
    mockAddDoc.mockResolvedValue({ id: 'mockId' });

    const memberData = { name: 'Test Member', email: 'test@example.com' };
    await addMember(memberData);

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), memberData);
  });

  test('updateMember should call Firestore updateDoc with correct params', async () => {
    const mockUpdateDoc = require('firebase/firestore').updateDoc;
    const mockDoc = require('firebase/firestore').doc;
    mockDoc.mockReturnValue('docRef');

    mockUpdateDoc.mockResolvedValue();

    const updates = { name: 'Updated Member' };
    await updateMember('memberId123', updates);

    expect(mockDoc).toHaveBeenCalledWith(db, 'members', 'memberId123');
    expect(mockUpdateDoc).toHaveBeenCalledWith('docRef', updates);
  });

  test('getMembers should return list of members', async () => {
    const mockGetDocs = require('firebase/firestore').getDocs;
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Member One' }) },
        { id: '2', data: () => ({ name: 'Member Two' }) }
      ]
    });

    const members = await getMembers();
    expect(members.length).toBe(2);
    expect(members[0]).toHaveProperty('name', 'Member One');
  });

  test('sendNotificationToAll sends messages to all members', async () => {
    const mockGetDocs = require('firebase/firestore').getDocs;
    const mockAddDoc = require('firebase/firestore').addDoc;

    mockGetDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ id: '1', name: 'Member1' }) },
        { id: '2', data: () => ({ id: '2', name: 'Member2' }) }
      ]
    });

    mockAddDoc.mockResolvedValue();

    await sendNotificationToAll('Test message');

    expect(mockAddDoc).toHaveBeenCalledTimes(2);
  });

  test('addMember throws error on Firestore failure', async () => {
    const mockAddDoc = require('firebase/firestore').addDoc;
    mockAddDoc.mockRejectedValue(new Error('Firestore error'));

    const memberData = { name: 'Error Member', email: 'fail@example.com' };
    await expect(addMember(memberData)).rejects.toThrow('Firestore error');
  });
});
