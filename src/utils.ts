// src/utils.ts

import { parseISO, differenceInYears } from 'date-fns';
import type { Trip, Product, Participant, Dish, MealPlanItem } from './types';

export const calculateAge = (birthDateString?: string): number | null => {
  if (!birthDateString) return null;
  try {
    const birthDate = parseISO(birthDateString);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (error) {
    console.error('Invalid date format for age calculation:', birthDateString);
    return null;
  }
};

export const getMealName = (mealNumber: number, totalMeals: number): string => {
  const names: { [key: number]: string[] } = {
    3: ['Завтрак', 'Обед', 'Ужин'],
    4: ['Завтрак', 'Перекус', 'Обед', 'Ужин'],
    5: ['Завтрак', 'Перекус', 'Обед', 'Полдник', 'Ужин'],
  };
  return names[totalMeals]?.[mealNumber - 1] || `Прием пищи ${mealNumber}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Не указано';
  try {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  } catch (error) {
    return 'Неверная дата';
  }
};

export const pluralize = (number: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const num = Math.abs(number);
  return words[num % 100 > 4 && num % 100 < 20 ? 2 : cases[Math.min(num % 10, 5)]];
};

interface TripSummary {
  totalWeight: number;
  totalNutrition: { calories: number; proteins: number; fats: number; carbs: number };
  tripParticipants: Participant[];
  perishableProducts: string[];
  averageWeightPerPersonPerDay: number;
  averageCaloriesPerPersonPerDay: number;
}

export const calculateTripSummary = (
  trip: Trip | undefined,
  allProducts: Product[],
  allParticipants: Participant[] = [],
  allDishes: Dish[] = []
): TripSummary => {
  const defaultSummary: TripSummary = {
    totalWeight: 0,
    totalNutrition: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
    tripParticipants: [],
    perishableProducts: [],
    averageWeightPerPersonPerDay: 0,
    averageCaloriesPerPersonPerDay: 0,
  };
  if (!trip || !allProducts || trip.days < 1) {
    return defaultSummary;
  }

  const participantsCount = trip.participants?.length || 1;
  const daysCount = trip.days;

  let totalWeightForOnePerson = 0;
  const totalNutritionForOnePerson = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
  const perishable = new Set<string>();

  const processProduct = (productId: number, weight: number) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      const weightRatio = weight / 100;
      totalWeightForOnePerson += weight;
      totalNutritionForOnePerson.calories += (product.calories || 0) * weightRatio;
      totalNutritionForOnePerson.proteins += (product.proteins || 0) * weightRatio;
      totalNutritionForOnePerson.fats += (product.fats || 0) * weightRatio;
      totalNutritionForOnePerson.carbs += (product.carbs || 0) * weightRatio;
      if (product.isPerishable) {
        perishable.add(product.name);
      }
    }
  };

  Object.values(trip.selectedMeals).forEach((mealItems) => {
    (mealItems as MealPlanItem[]).forEach((item) => {
      if (item.type === 'product') {
        processProduct(item.itemId, item.weight);
      } else if (item.type === 'dish') {
        const dish = allDishes.find((d) => d.id === item.itemId);
        dish?.products.forEach((dishProduct) => {
          processProduct(dishProduct.productId, dishProduct.weight);
        });
      }
    });
  });

  const totalWeight = totalWeightForOnePerson * participantsCount;
  const totalNutrition = {
    calories: Math.round(totalNutritionForOnePerson.calories * participantsCount),
    proteins: Math.round(totalNutritionForOnePerson.proteins * participantsCount),
    fats: Math.round(totalNutritionForOnePerson.fats * participantsCount),
    carbs: Math.round(totalNutritionForOnePerson.carbs * participantsCount),
  };

  const averageWeightPerPersonPerDay =
    daysCount > 0 ? Math.round(totalWeightForOnePerson / daysCount) : 0;
  const averageCaloriesPerPersonPerDay =
    daysCount > 0 ? Math.round(totalNutritionForOnePerson.calories / daysCount) : 0;

  const tripParticipants = allParticipants.filter((p) => trip.participants?.includes(p.id));

  return {
    totalWeight,
    totalNutrition,
    tripParticipants,
    perishableProducts: Array.from(perishable),
    averageWeightPerPersonPerDay,
    averageCaloriesPerPersonPerDay,
  };
};
