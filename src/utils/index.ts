// src/utils.ts

import { format, parseISO, isAfter, isBefore, startOfDay, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Trip, Product, Participant, Dish, MealPlanItem } from './types';

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '...';
  try {
    const date = parseISO(dateString);
    return isValid(date) ? format(date, 'd MMM yyyy', { locale: ru }) : 'Некорректная дата';
  } catch (error) {
    return 'Ошибка формата';
  }
};

export const getEffectiveStatus = (
  trip: Pick<Trip, 'status' | 'startDate' | 'endDate'>
): 'planning' | 'active' | 'completed' => {
  if (trip.status !== 'planning') {
    return trip.status;
  }
  const today = startOfDay(new Date());
  const start = parseISO(trip.startDate);
  const end = parseISO(trip.endDate);
  if (isBefore(today, start)) {
    return 'planning';
  }
  if (isAfter(today, end)) {
    return 'completed';
  }
  return 'active';
};

export const calculateAge = (birthDate: string | null | undefined): number | null => {
  if (!birthDate) return null;
  try {
    const birth = new Date(birthDate);
    if (!isValid(birth)) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  } catch {
    return null;
  }
};

const getMealItems = (
  trip: Trip | null,
  day: number,
  mealTypeId: number | null,
  products: Product[],
  dishes: Dish[]
): {
  items: { product: Product; weight: number }[];
  productCount: number;
} => {
  if (!trip) return { items: [], productCount: 0 };

  const mealId = mealTypeId !== null ? `${day}-${mealTypeId}` : null;
  const selectedMeals = trip.selectedMeals || {};
  let productCount = 0;

  const getProductsForMeal = (mealKey: string): { product: Product; weight: number }[] => {
    const items = selectedMeals[mealKey] || [];
    productCount += items.length;

    return items.flatMap((item: MealPlanItem) => {
      if (item.type === 'product') {
        const product = products.find((p) => p.id === item.itemId);
        return product ? [{ product, weight: item.weight || 0 }] : [];
      } else if (item.type === 'dish') {
        const dish = dishes.find((d) => d.id === item.itemId);
        if (!dish) return [];
        return dish.products.flatMap((dishProduct) => {
          const product = products.find((p) => p.id === dishProduct.productId);
          return product ? [{ product, weight: dishProduct.weight }] : [];
        });
      }
      return [];
    });
  };

  if (mealId !== null) {
    return { items: getProductsForMeal(mealId), productCount };
  } else {
    // Если mealTypeId не указан, собираем продукты за весь день
    const dayMeals = trip.dayMeals?.[day.toString()] || [];
    const allDayProducts = dayMeals.flatMap((mtId) => {
      const dayMealId = `${day}-${mtId}`;
      return getProductsForMeal(dayMealId);
    });
    return { items: allDayProducts, productCount };
  }
};

const calculateNutritionForItems = (
  items: { product: Product; weight: number }[]
): {
  weight: number;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
} => {
  return items.reduce(
    (acc, { product, weight }) => {
      const ratio = weight / 100;
      acc.weight += weight;
      acc.calories += (product.calories || 0) * ratio;
      acc.proteins += (product.proteins || 0) * ratio;
      acc.fats += (product.fats || 0) * ratio;
      acc.carbs += (product.carbs || 0) * ratio;
      return acc;
    },
    { weight: 0, calories: 0, proteins: 0, fats: 0, carbs: 0 }
  );
};

export const calculateMealNutrition = (
  trip: Trip | null,
  day: number,
  mealTypeId: number,
  products: Product[],
  dishes: Dish[]
) => {
  const { items, productCount } = getMealItems(trip, day, mealTypeId, products, dishes);
  const nutrition = calculateNutritionForItems(items);
  return {
    weight: Math.round(nutrition.weight),
    calories: Math.round(nutrition.calories),
    proteins: Math.round(nutrition.proteins),
    fats: Math.round(nutrition.fats),
    carbs: Math.round(nutrition.carbs),
    productCount,
  };
};

export const calculateDayNutrition = (
  trip: Trip | null,
  day: number,
  products: Product[],
  dishes: Dish[]
) => {
  const { items } = getMealItems(trip, day, null, products, dishes);
  const nutrition = calculateNutritionForItems(items);
  const participantsCount = trip?.participants?.length || 1;
  const totalWeightForAllUsers = Math.round(nutrition.weight);
  const weightPerUser =
    participantsCount > 0 ? Math.round(nutrition.weight / participantsCount) : 0;

  return {
    totalWeightForAllUsers,
    weightPerUser,
    calories: participantsCount > 0 ? Math.round(nutrition.calories / participantsCount) : 0,
    proteins: participantsCount > 0 ? Math.round(nutrition.proteins / participantsCount) : 0,
    fats: participantsCount > 0 ? Math.round(nutrition.fats / participantsCount) : 0,
    carbs: participantsCount > 0 ? Math.round(nutrition.carbs / participantsCount) : 0,
  };
};

export const calculateTripSummary = (
  trip: Trip | null,
  products: Product[],
  participants: Participant[],
  dishes: Dish[]
) => {
  if (!trip)
    return {
      totalWeight: 0,
      totalCalories: 0,
      averageWeightPerPersonPerDay: 0,
      averageCaloriesPerPersonPerDay: 0,
    };

  const totalNutrition = { weight: 0, calories: 0, proteins: 0, fats: 0, carbs: 0 };
  for (let day = 1; day <= trip.days; day++) {
    const { items } = getMealItems(trip, day, null, products, dishes);
    const dayNutrition = calculateNutritionForItems(items);
    totalNutrition.weight += dayNutrition.weight;
    totalNutrition.calories += dayNutrition.calories;
  }

  const participantsCount = trip.participants?.length || 1;
  const totalDays = trip.days || 1;

  const averageWeightPerPersonPerDay =
    participantsCount > 0 && totalDays > 0
      ? Math.round(totalNutrition.weight / participantsCount / totalDays)
      : 0;
  const averageCaloriesPerPersonPerDay =
    participantsCount > 0 && totalDays > 0
      ? Math.round(totalNutrition.calories / participantsCount / totalDays)
      : 0;

  return {
    totalWeight: totalNutrition.weight,
    totalCalories: totalNutrition.calories,
    averageWeightPerPersonPerDay,
    averageCaloriesPerPersonPerDay,
  };
};
