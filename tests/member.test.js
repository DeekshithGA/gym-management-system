// member.test.js
import {
  addMember,
  updateMember,
  deleteMember,
  getMemberById,
  listMembers
} from './member.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn()
}));

describe('Member Module Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('addMember calls addDoc with member data', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue({ id: 'mockId' });

    const newMember = { name: 'John Doe', email: 'john@example.com' };
    await addMember(newMember);

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), newMember);
  });

  test('updateMember calls updateDoc with correct arguments', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    updateDoc.mockResolvedValue();

    const updates = { email: 'new-email@example.com' };
    await updateMember('memberId123', updates);

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'members', 'memberId123');
    expect(updateDoc).toHaveBeenCalledWith('docRef', updates);
  });

  test('deleteMember calls deleteDoc with correct doc reference', async () => {
    const deleteDoc = require('firebase/firestore').deleteDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    deleteDoc.mockResolvedValue();

    await deleteMember('memberId123');

    expect(doc).toHaveBeenCalledWith(expect.anything(), 'members', 'memberId123');
    expect(deleteDoc).toHaveBeenCalledWith('docRef');
  });

  test('getMemberById returns member data', async () => {
    const getDoc = require('firebase/firestore').getDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ name: 'John Doe' }) });

    const member = await getMemberById('memberId123');
    expect(member).toHaveProperty('name', 'John Doe');
  });

  test('listMembers returns array of members', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Member One' }) },
        { id: '2', data: () => ({ name: 'Member Two' }) }
      ]
    });

    const members = await listMembers();
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBe(2);
    expect(members[0]).toHaveProperty('name');
  });
});
