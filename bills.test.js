// bills.test.js
import { createBill, updateBillStatus, generateBillsReport, refundBill, exportBillAsPdf } from './bills.js';
import { db } from './firebase-config.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn()
}));

describe('Bills Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createBill should add a bill document with correct data', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue({ id: 'billId123' });

    const billData = { memberId: 'm1', amount: 50, currency: 'USD', status: 'pending' };
    const billId = await createBill(billData);

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), billData);
    expect(billId).toEqual(undefined); // createBill does not return id in provided code, adapt if changed
  });

  test('updateBillStatus updates bill status successfully', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('docRef');
    updateDoc.mockResolvedValue();

    await updateBillStatus('billId123', 'paid');

    expect(doc).toHaveBeenCalledWith(db, 'bills', 'billId123');
    expect(updateDoc).toHaveBeenCalledWith('docRef', { status: 'paid', updatedAt: expect.any(String) });
  });

  test('generateBillsReport returns CSV formatted string', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    const mockBills = [
      { memberId: 'm1', amount: 50, currency: 'USD', status: 'paid', createdAt: '2025-01-01T00:00:00Z' },
      { memberId: 'm2', amount: 40, currency: 'USD', status: 'pending', createdAt: '2025-01-03T00:00:00Z' }
    ];
    getDocs.mockResolvedValue({ docs: mockBills.map(b => ({ data: () => b })) });

    const csv = await generateBillsReport('2025-01-01', '2025-01-31');
    expect(csv).toContain('memberId,amount,currency,status,createdAt');
    expect(csv).toContain('m1,50,USD,paid,2025-01-01T00:00:00Z');
    expect(csv).toContain('m2,40,USD,pending,2025-01-03T00:00:00Z');
  });

  test('refundBill calls updateBillStatus with refunded status', async () => {
    const updateBillStatus = jest.fn();
    jest.doMock('./bills.js', () => ({ updateBillStatus }));
    const { refundBill } = require('./bills.js');

    await refundBill('billId123', 50, 'Customer requested refund');
    expect(updateBillStatus).toHaveBeenCalledWith('billId123', 'refunded', expect.objectContaining({ refundAmount: 50 }));
  });

  test('exportBillAsPdf placeholder runs without error', () => {
    expect(() => exportBillAsPdf({})).not.toThrow();
  });
});
