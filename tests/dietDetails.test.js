// dietDetails.test.js
import {
  saveDietPlan,
  getDietPlan,
  logNutrientIntake,
  getNutrientIntake,
  logWaterIntake,
  getWaterIntake,
  addSupplementRecommendation,
  getSupplements,
  addFavoriteMeal,
  getFavoriteMeals,
  postDietComment
} from './dietDetails.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn()
}));

describe('Diet Details Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('saveDietPlan calls addDoc with correct data', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    const plan = {
      meals: [{ name: "Breakfast", calories: 400 }],
      caloriesGoal: 2200,
      proteinGoal: 150
    };
    await saveDietPlan('member123', plan);
    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      memberId: 'member123',
      caloriesGoal: 2200
    }));
  });

  test('getDietPlan returns the latest assigned plan', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ memberId: 'member123', assignedAt: '2025-08-01' }) },
        { data: () => ({ memberId: 'member123', assignedAt: '2025-08-20' }) }
      ]
    });

    const plan = await getDietPlan('member123');
    expect(plan).toBeDefined();
    expect(plan.assignedAt).toBe('2025-08-20');
  });

  test('logNutrientIntake calls setDoc appropriately', async () => {
    const setDoc = require('firebase/firestore').setDoc;
    setDoc.mockResolvedValue();

    const intake = { calories: 1800, protein: 140 };
    await logNutrientIntake('member123', '2025-08-26', intake);
    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  test('getNutrientIntake returns data when exists', async () => {
    const getDoc = require('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ calories: 1800 }) });

    const data = await getNutrientIntake('member123', '2025-08-26');
    expect(data.calories).toBe(1800);
  });

  test('logWaterIntake calls setDoc with correct data', async () => {
    const setDoc = require('firebase/firestore').setDoc;
    setDoc.mockResolvedValue();

    await logWaterIntake('member123', '2025-08-26', 2.5);
    expect(setDoc).toHaveBeenCalled();
  });

  test('getWaterIntake returns default liters 0 if no data', async () => {
    const getDoc = require('firebase/firestore').getDoc;
    getDoc.mockResolvedValue({ exists: () => false });

    const water = await getWaterIntake('member123', '2025-08-26');
    expect(water.liters).toBe(0);
  });

  test('addSupplementRecommendation calls addDoc', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    const supplement = { name: "Vitamin C", dosage: "500mg" };
    await addSupplementRecommendation('member123', supplement);
    expect(addDoc).toHaveBeenCalledTimes(1);
  });

  test('getSupplements returns data array', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ memberId: 'member123', name: 'Vitamin C' }) }
      ]
    });

    const supps = await getSupplements('member123');
    expect(supps.length).toBe(1);
  });

  test('addFavoriteMeal calls addDoc', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await addFavoriteMeal('member123', { name: 'Chicken Salad' });
    expect(addDoc).toHaveBeenCalled();
  });

  test('getFavoriteMeals returns correct data', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ memberId: 'member123', name: 'Chicken Salad' }) }
      ]
    });

    const favs = await getFavoriteMeals('member123');
    expect(favs.length).toBe(1);
  });

  test('postDietComment adds a comment successfully', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await postDietComment('member123', 'plan123', 'Great plan!');
    expect(addDoc).toHaveBeenCalled();
  });
});
