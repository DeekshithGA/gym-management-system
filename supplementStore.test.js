// supplementstore.test.js
import {
  addProduct,
  getProducts,
  updateStock,
  applyDiscount,
  addReview,
  getProductReviews,
  toggleWishlist,
  checkStockLevels,
  redeemLoyaltyPoints
} from './supplementStore.js';

jest.mock('./firebase-config.js');
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

describe('Supplement Store Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('addProduct uploads image and saves product data', async () => {
    const uploadBytes = require('firebase/storage').uploadBytes;
    const getDownloadURL = require('firebase/storage').getDownloadURL;
    const addDoc = require('firebase/firestore').addDoc;

    uploadBytes.mockResolvedValue();
    getDownloadURL.mockResolvedValue('https://mockurl/image.jpg');
    addDoc.mockResolvedValue();

    const product = {
      name: 'Test Supplement',
      description: 'Description',
      price: 25,
      stockQuantity: 100,
      sku: 'SKU123',
      category: 'Vitamins',
      discount: 10
    };

    const imageFile = new File([''], 'image.jpg');

    await addProduct(product, imageFile);

    expect(uploadBytes).toHaveBeenCalled();
    expect(getDownloadURL).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      name: product.name,
      price: product.price,
      discount: 10,
    }));
  });

  test('getProducts returns products, filtered by category', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    const query = require('firebase/firestore').query;
    const where = require('firebase/firestore').where;

    getDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Product1', category: 'Vitamins' }) },
        { id: '2', data: () => ({ name: 'Product2', category: 'Vitamins' }) }
      ]
    });

    const products = await getProducts('Vitamins');
    expect(products.length).toBe(2);
    expect(products[0]).toHaveProperty('category', 'Vitamins');
  });

  test('updateStock updates product quantity', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('mockDocRef');
    updateDoc.mockResolvedValue();

    await updateStock('prod123', 50);
    expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { stockQuantity: 50 });
  });

  test('applyDiscount sets product discount', async () => {
    const updateDoc = require('firebase/firestore').updateDoc;
    const doc = require('firebase/firestore').doc;
    doc.mockReturnValue('mockDocRef');
    updateDoc.mockResolvedValue();

    await applyDiscount('prod123', 15);
    expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { discount: 15 });
  });

  test('addReview adds a product review', async () => {
    const addDoc = require('firebase/firestore').addDoc;
    addDoc.mockResolvedValue();

    await addReview('prod123', 'member123', 5, 'Great product!');
    expect(addDoc).toHaveBeenCalled();
  });

  test('getProductReviews returns review list', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    const query = require('firebase/firestore').query;
    const where = require('firebase/firestore').where;

    getDocs.mockResolvedValue({
      docs: [
        { data: () => ({ rating: 5, comment: 'Excellent' }) }
      ]
    });

    const reviews = await getProductReviews('prod123');
    expect(reviews.length).toBe(1);
    expect(reviews[0]).toHaveProperty('rating', 5);
  });

  test('toggleWishlist adds and removes product from wishlist', async () => {
    const getDocs = require('firebase/firestore').getDocs;
    const addDoc = require('firebase/firestore').addDoc;
    const deleteDoc = require('firebase/firestore').deleteDoc;
    const query = require('firebase/firestore').query;
    const where = require('firebase/firestore').where;
    const doc = require('firebase/firestore').doc;

    // Initially no wishlist entry, should add
    getDocs.mockResolvedValue({ empty: true, docs: [] });
    addDoc.mockResolvedValue();

    const added = await toggleWishlist('member123', 'prod123');
    expect(added).toBe(true);
    expect(addDoc).toHaveBeenCalled();

    // Already in wishlist, should remove
    getDocs.mockResolvedValue({ empty: false, docs: [{ id: 'wishDocId' }] });
    deleteDoc.mockResolvedValue();
    doc.mockReturnValue('docRef');

    const removed = await toggleWishlist('member123', 'prod123');
    expect(removed).toBe(false);
    expect(deleteDoc).toHaveBeenCalledWith('docRef');
  });

  test('checkStockLevels warns if low stock', async () => {
    const getProducts = require('./supplementStore.js').getProducts;
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});

    // Mock products with low stock
    jest.mock('./supplementStore.js', () => ({
      getProducts: jest.fn().mockResolvedValue([
        { name: 'Prod Low', stockQuantity: 3 },
        { name: 'Prod OK', stockQuantity: 10 }
      ])
    }));

    await checkStockLevels();

    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Low stock alert for products'));
    console.warn.mockRestore();
  });

  test('redeemLoyaltyPoints logs redemption', async () => {
    const logEvent = require('./logging.js').logEvent;

    await redeemLoyaltyPoints('member123', 100);
    expect(logEvent).toHaveBeenCalledWith('Loyalty points redeemed', { memberId: 'member123', points: 100 });
  });
});
