// src/components/meals/mealFormUtils.ts
import type { Product, Dish, Meal } from '../../types';

type NutritionItem = {
  type: 'product' | 'dish';
  itemId: number;
  weight?: number;
};

export const calculateNutrition = (item: NutritionItem, products: Product[], dishes: Dish[]) => {
  if (item.type === 'product') {
    const product = products.find((p) => p.id === item.itemId);
    if (!product || !item.weight) return null;
    const multiplier = item.weight / 100;
    return {
      calories: Math.round(product.calories * multiplier),
      proteins: Math.round(product.proteins * multiplier * 10) / 10,
      fats: Math.round(product.fats * multiplier * 10) / 10,
      carbs: Math.round(product.carbs * multiplier * 10) / 10,
    };
  }
  if (item.type === 'dish') {
    const dish = dishes.find((d) => d.id === item.itemId);
    if (!dish) return null;
    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0;
    dish.products.forEach((dishProduct) => {
      const product = products.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = dishProduct.weight / 100;
        totalCalories += (product.calories || 0) * weightRatio;
        totalProteins += (product.proteins || 0) * weightRatio;
        totalFats += (product.fats || 0) * weightRatio;
        totalCarbs += (product.carbs || 0) * weightRatio;
      }
    });
    return {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
    };
  }
  return null;
};

export const isMealNameUnique = (
  name: string,
  existingMeals: Meal[],
  excludeId?: number
): boolean => {
  if (!name || !name.trim()) return true; // Empty names are allowed

  const normalizedName = name.trim().toLowerCase();
  return !existingMeals.some((meal) => {
    // Skip the current meal being edited
    if (excludeId && meal.id === excludeId) return false;

    return meal.name.trim().toLowerCase() === normalizedName;
  });
};

export const generateDefaultMealName = (nextId: number): string => {
  return `Приём пищи №${nextId}`;
};

// Helper to generate unique name with timestamp fallback
export const generateUniqueMealName = (meals: Meal[]): string => {
  // Find the highest meal number currently in use
  let maxNumber = 0;
  const mealNumberRegex = /^Приём пищи №(\d+)$/;

  meals.forEach((meal) => {
    const match = meal.name.match(mealNumberRegex);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number > maxNumber) {
        maxNumber = number;
      }
    }
  });

  // Next number should be one higher than the highest existing number
  const nextNumber = maxNumber + 1;
  const baseName = `Приём пищи №${nextNumber}`;

  // Check if this name already exists (shouldn't happen with our logic, but just in case)
  const nameExists = meals.some((meal) => meal.name === baseName);

  if (!nameExists) {
    return baseName;
  }

  // If it exists, add timestamp suffix to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  return `${baseName}-${timestamp}`;
};
