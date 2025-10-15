import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logEvent } from './logging.js';

// Create or update personalized diet plan for a member
export async function saveDietPlan(memberId, plan) {
  try {
    // plan example: { meals: [...], caloriesGoal: 2200, proteinGoal: 150, fatGoal: 70, carbsGoal: 300 }
    const dietPlansRef = collection(db, "dietPlans");
    // For simplicity, overwrite existing or create new
    await addDoc(dietPlansRef, { memberId, ...plan, assignedAt: new Date().toISOString() });
    logEvent("Diet plan saved", { memberId, plan });
  } catch (err) {
    console.error("Save diet plan error:", err);
  }
}

// Get diet plan for member
export async function getDietPlan(memberId) {
  try {
    const snapshot = await getDocs(collection(db, "dietPlans"));
    const plans = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    const memberPlans = plans.filter(p => p.memberId === memberId);
    // Return latest assigned plan
    return memberPlans.sort((a,b) => new Date(b.assignedAt) - new Date(a.assignedAt))[0] || null;
  } catch (err) {
    console.error("Get diet plan error:", err);
    return null;
  }
}

// Log nutrient intake for a day
export async function logNutrientIntake(memberId, dateStr, intake) {
  // intake example: { calories: 1800, protein: 140, fat: 65, carbs: 280 }
  try {
    const intakeId = `${memberId}_${dateStr}`;
    await setDoc(doc(db, "nutrientIntake", intakeId), { memberId, date: dateStr, ...intake });
    logEvent("Nutrient intake logged", { memberId, dateStr, intake });
  } catch (err) {
    console.error("Log nutrient intake error:", err);
  }
}

// Get daily nutrient intake summary
export async function getNutrientIntake(memberId, dateStr) {
  try {
    const docSnap = await getDoc(doc(db, "nutrientIntake", `${memberId}_${dateStr}`));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    console.error("Get nutrient intake error:", err);
    return null;
  }
}

// Log water intake
export async function logWaterIntake(memberId, dateStr, liters) {
  try {
    const waterId = `${memberId}_${dateStr}`;
    await setDoc(doc(db, "waterIntake", waterId), { memberId, date: dateStr, liters });
    logEvent("Water intake logged", { memberId, dateStr, liters });
  } catch (err) {
    console.error("Log water intake error:", err);
  }
}

// Get water intake of day
export async function getWaterIntake(memberId, dateStr) {
  try {
    const docSnap = await getDoc(doc(db, "waterIntake", `${memberId}_${dateStr}`));
    return docSnap.exists() ? docSnap.data() : { liters: 0 };
  } catch (err) {
    console.error("Get water intake error:", err);
    return { liters: 0 };
  }
}

// Supplement recommendation management
export async function addSupplementRecommendation(memberId, supplement) {
  // supplement example: { name: "Whey Protein", dosage: "30g/day", startDate, endDate }
  try {
    await addDoc(collection(db, "supplementRecommendations"), { memberId, ...supplement });
    logEvent("Supplement recommendation added", { memberId, supplement });
  } catch (err) {
    console.error("Add supplement recommendation error:", err);
  }
}
export async function getSupplements(memberId) {
  try {
    const snapshot = await getDocs(collection(db, "supplementRecommendations"));
    return snapshot.docs.filter(doc => doc.data().memberId === memberId).map(doc => doc.data());
  } catch (err) {
    console.error("Get supplements error:", err);
    return [];
  }
}

// Export diet plan as CSV
export async function exportDietPlanCSV(memberId) {
  const plan = await getDietPlan(memberId);
  if (!plan) return null;
  let csv = "Meal,Calories,Protein(g),Fat(g),Carbs(g)\n";
  for (const meal of plan.meals) {
    csv += `${meal.name},${meal.calories},${meal.protein},${meal.fat},${meal.carbs}\n`;
  }
  return csv;
}

// Add favorite meal by member
export async function addFavoriteMeal(memberId, meal) {
  // meal example: { name, calories, protein, fat, carbs }
  try {
    await addDoc(collection(db, "favorites"), { memberId, ...meal, addedAt: new Date().toISOString() });
    logEvent("Favorite meal added", { memberId, meal });
  } catch (err) {
    console.error("Add favorite meal error:", err);
  }
}

// Get favorite meals
export async function getFavoriteMeals(memberId) {
  try {
    const snapshot = await getDocs(collection(db, "favorites"));
    return snapshot.docs.filter(doc => doc.data().memberId === memberId).map(doc => doc.data());
  } catch (err) {
    console.error("Get favorite meals error:", err);
    return [];
  }
}

// Post comment on diet plan
export async function postDietComment(memberId, planId, comment) {
  try {
    await addDoc(collection(db, "dietComments"), { memberId, planId, comment, postedAt: new Date().toISOString() });
    logEvent("Diet comment posted", { memberId, planId, comment });
  } catch (err) {
    console.error("Post diet comment error:", err);
  }
}

// Placeholder for integration with external nutrition API for calorie counts, recipes etc.
export async function getNutritionInfo(foodName) {
  // Example fetch for nutrition APIs like Edamam, Nutritionix (API keys needed)
  return {
    calories: 200,
    protein: 10,
    fat: 5,
    carbs: 30
  };
}
