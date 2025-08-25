import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";
import { logEvent } from './logging.js';

// Add new supplement product with image upload
export async function addProduct(product, imageFile) {
  try {
    // Upload image to Firebase Storage
    const imageRef = ref(storage, `supplements/${imageFile.name}`);
    await uploadBytes(imageRef, imageFile);
    const imageUrl = await getDownloadURL(imageRef);

    // Add product data to Firestore
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      category: product.category || 'General',
      expiryDate: product.expiryDate || null,
      discount: product.discount || 0,
      imageUrl,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'supplements'), productData);
    logEvent('Product added', productData);
  } catch (err) {
    console.error('Error adding product:', err);
    throw err;
  }
}

// Get list of all supplements optionally filtered by category
export async function getProducts(category = null) {
  try {
    let productsQuery = collection(db, 'supplements');
    if (category) {
      const q = query(productsQuery, where('category', '==', category));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

// Update stock quantity for a supplement
export async function updateStock(productId, newQuantity) {
  try {
    const productRef = doc(db, 'supplements', productId);
    await updateDoc(productRef, { stockQuantity: newQuantity });
    logEvent('Stock updated', { productId, newQuantity });
  } catch (err) {
    console.error('Error updating stock:', err);
    throw err;
  }
}

// Apply discount to a product
export async function applyDiscount(productId, discountPercent) {
  try {
    const productRef = doc(db, 'supplements', productId);
    await updateDoc(productRef, { discount: discountPercent });
    logEvent('Discount applied', { productId, discountPercent });
  } catch (err) {
    console.error('Error applying discount:', err);
    throw err;
  }
}

// Add product review by member
export async function addReview(productId, memberId, rating, comment) {
  try {
    const reviewData = {
      productId,
      memberId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'supplementReviews'), reviewData);
    logEvent('Review added', reviewData);
  } catch (err) {
    console.error('Error adding review:', err);
    throw err;
  }
}

// Get reviews for a product
export async function getProductReviews(productId) {
  try {
    const q = query(collection(db, 'supplementReviews'), where('productId', '==', productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return [];
  }
}

// Manage member wishlist: add or remove product
export async function toggleWishlist(memberId, productId) {
  try {
    const wishlistCollection = collection(db, 'wishlists');
    const q = query(wishlistCollection, where('memberId', '==', memberId), where('productId', '==', productId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Add to wishlist
      await addDoc(wishlistCollection, { memberId, productId, addedAt: new Date().toISOString() });
      logEvent('Wishlist added', { memberId, productId });
      return true; // added
    } else {
      // Remove from wishlist
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(db, 'wishlists', docId));
      logEvent('Wishlist removed', { memberId, productId });
      return false; // removed
    }
  } catch (err) {
    console.error('Wishlist toggle error:', err);
    throw err;
  }
}

// Notify admin when product stock is low
export async function checkStockLevels() {
  try {
    const products = await getProducts();
    const lowStockProducts = products.filter(p => p.stockQuantity <= 5);
    if (lowStockProducts.length > 0) {
      // Send notification or alert (you can implement notifications module)
      console.warn('Low stock alert for products:', lowStockProducts.map(p => p.name));
    }
  } catch (err) {
    console.error('Error checking stock levels:', err);
  }
}

// Redeem loyalty points (assumes loyalty management implemented elsewhere)
export async function redeemLoyaltyPoints(memberId, points) {
  try {
    // Implement points deduction and rewards tracking
    logEvent('Loyalty points redeemed', { memberId, points });
  } catch (err) {
    console.error('Redeem loyalty points error:', err);
  }
}
