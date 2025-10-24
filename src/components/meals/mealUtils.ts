// src/components/meals/mealUtils.ts
import { MealData } from '../../types';
import { useMealStore } from '../../stores/useMealStore';

/**
 * Utility function to create a new meal
 * This function can be used by different components to ensure consistent behavior
 * when creating new meals
 *
 * @param mealData - The data for the new meal
 * @returns The created meal object
 */
export const createMeal = (mealData: MealData) => {
  const { addMeal } = useMealStore.getState();
  return addMeal(mealData);
};

/**
 * Utility function to handle navigation after meal creation
 * Ensures consistent navigation behavior across the app
 *
 * @param navigate - The navigate function from react-router-dom
 * @param createdMealId - The ID of the created meal
 */
export const handleMealCreationNavigation = (
  navigate: (path: string) => void,
  createdMealId: number
) => {
  // Navigate to the meals list page and highlight the new meal
  navigate(`/meals?selectedId=${createdMealId}`);
};

/**
 * Generate a default name for a new meal
 *
 * @param mealCount - The current number of meals
 * @returns A default meal name
 */
export const generateDefaultMealName = (mealCount: number): string => {
  return `Приём пищи #${mealCount + 1}`;
};
