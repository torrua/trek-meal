// src/utils.ts
import type { Trip, Product, Participant, Dish, MealPlanItem } from './types';

// Функции getMealName, formatDate, pluralize, calculateDays, calculateEndDate остаются без изменений.
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
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

export const pluralize = (number: number, words: [string, string, string]): string => {
  const cases = [2, 0, 1, 1, 1, 2];
  const num = Math.abs(number);
  return words[num % 100 > 4 && num % 100 < 20 ? 2 : cases[Math.min(num % 10, 5)]];
};

export const calculateDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) return 1;
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

export const calculateEndDate = (startDate: string, days: number): string => {
  if (!startDate || !days || days < 1) return '';
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + days - 1);
  return end.toISOString().split('T')[0];
};

interface TripSummary {
  totalWeight: number;
  totalNutrition: { calories: number; proteins: number; fats: number; carbs: number };
  tripParticipants: Participant[];
  perishableProducts: string[];
  averageWeightPerPersonPerDay: number;
  averageCaloriesPerPersonPerDay: number;
}

// --- ИСПРАВЛЕННАЯ ВЕРСИЯ ---
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

  // Аккумуляторы для СУММАРНЫХ значений на одного человека за ВЕСЬ поход
  let totalWeightForOnePerson = 0;
  const totalNutritionForOnePerson = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
  const perishable = new Set<string>();

  // Вспомогательная функция для обработки одного продукта
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

  // --- ГЛАВНОЕ ИЗМЕНЕНИЕ ---
  // Итерируем по ВСЕМ запланированным приемам пищи, а не только первого дня.
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

  // Теперь, когда у нас есть СУММАРНЫЕ значения на одного человека,
  // мы можем рассчитать итоговые и средние показатели.
  const totalWeight = totalWeightForOnePerson * participantsCount;
  const totalNutrition = {
    calories: Math.round(totalNutritionForOnePerson.calories * participantsCount),
    proteins: Math.round(totalNutritionForOnePerson.proteins * participantsCount),
    fats: Math.round(totalNutritionForOnePerson.fats * participantsCount),
    carbs: Math.round(totalNutritionForOnePerson.carbs * participantsCount),
  };

  // Рассчитываем ЧЕСТНЫЕ средние значения, деля суммарные показатели на количество дней
  const averageWeightPerPersonPerDay = Math.round(totalWeightForOnePerson / daysCount);
  const averageCaloriesPerPersonPerDay = Math.round(
    totalNutritionForOnePerson.calories / daysCount
  );

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
