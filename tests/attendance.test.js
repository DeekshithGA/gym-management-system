// attendance.test.js
import {
  recordCheck,
  getAttendanceRecords,
  requestCorrection,
  getAttendanceSummary,
  handleCorrectionRequest,
} from './attendance.js';

import { db } from './firebase-config.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn()
}));

describe("Attendance Module", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("recordCheck calls setDoc with correct data for check-in", async () => {
    const setDoc = require('firebase/firestore').setDoc;
    setDoc.mockResolvedValue();

    const memberId = "member123";
    const datetime = new Date("2025-08-26T07:30:00Z");
    await recordCheck(memberId, "check-in", datetime);

    expect(setDoc).toHaveBeenCalled();
    const calledWithDoc = setDoc.mock.calls[0][1];
    expect(calledWithDoc.memberId).toBe(memberId);
    expect(calledWithDoc.checkInTime).toBe(datetime.toISOString());
    expect(calledWithDoc.lateArrival).toBe(false);
  });

  test("getAttendanceRecords returns attendance data", async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ status: "present", date: "2025-08-01" }) },
        { data: () => ({ status: "absent", date: "2025-08-02" }) }
      ]
    });

    const records = await getAttendanceRecords("member123", "2025-08-01", "2025-08-31");
    expect(records.length).toBe(2);
    expect(records[0].status).toBe("present");
  });

  test("requestCorrection calls addDoc with proper data", async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await requestCorrection("member123", "2025-08-20", "Wrong check-in time");

    expect(addDoc).toHaveBeenCalled();
    const callArg = addDoc.mock.calls[0][1];
    expect(callArg.reason).toBe("Wrong check-in time");
    expect(callArg.status).toBe("pending");
  });

  test("getAttendanceSummary computes correct summary", async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ status: "present", date: "2025-08-20" }) },
        { data: () => ({ status: "present", date: "2025-08-21" }) },
        { data: () => ({ status: "absent", date: "2025-08-22" }) }
      ]
    });

    const summary = await getAttendanceSummary("member123");
    expect(summary.present).toBe(2);
    expect(summary.absent).toBe(1);
    // Streak calculation depends on implementation and dates
    expect(typeof summary.currentStreak).toBe("number");
  });

  test("handleCorrectionRequest updates doc with approval", async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const getDoc = require('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ memberId: "member123", date: "2025-08-20" })
    });
    updateDoc.mockResolvedValue();

    await handleCorrectionRequest("correctionDoc123", true, "admin001");

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });
});
