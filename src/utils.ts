// src/utils.ts
import type { Trip, Product, Participant } from './types';

export const getMealName = (mealNumber: number, totalMeals: number): string => {
    const names: { [key: number]: string[] } = {
      3: ['Завтрак', 'Обед', 'Ужин'],
      4: ['Завтрак', 'Перекус', 'Обед', 'Ужин'],
      5: ['Завтрак', 'Перекус', 'Обед', 'Полдник', 'Ужин'],
    };
    return (names[totalMeals]?.[mealNumber - 1]) || `Прием пищи ${mealNumber}`;
};
  
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'Не указано';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
};

export const pluralize = (number: number, words: [string, string, string]): string => {
    const cases = [2, 0, 1, 1, 1, 2];
    const num = Math.abs(number);
    return words[
      (num % 100 > 4 && num % 100 < 20)
        ? 2
        : cases[Math.min(num % 10, 5)]
    ];
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
  
// Определяем тип для возвращаемого значения
interface TripSummary {
  totalWeight: number;
  totalNutrition: { calories: number, proteins: number, fats: number, carbs: number };
  tripParticipants: Participant[];
  productBreakdown: { name: string; weight: number, totalWeight: number }[];
  perishableProducts: string[];
  averageWeightPerPersonPerDay: number;
  averageCaloriesPerPersonPerDay: number;
}

export const calculateTripSummary = (
  trip: Trip | undefined, 
  allProducts: Product[], 
  allParticipants: Participant[] = []
): TripSummary => {
    const defaultSummary: TripSummary = {
      totalWeight: 0,
      totalNutrition: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
      tripParticipants: [],
      productBreakdown: [],
      perishableProducts: [],
      averageWeightPerPersonPerDay: 0,
      averageCaloriesPerPersonPerDay: 0,
    };
    if (!trip || !allProducts) {
      return defaultSummary;
    }
  
    const participantsCount = trip.participants?.length || 1;
    const daysCount = trip.days || 1;
    
    let baseDailyWeight = 0;
    const baseDailyNutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    const perishable = new Set<string>();
    const productUsage: { [id: number]: { name: string, weight: number } } = {};
  
    Object.values(trip.selectedMeals || {}).forEach(mealProducts => {
      mealProducts.forEach(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
          const portionWeight = item.weight || 0;
          const weightRatio = portionWeight / 100;
  
          baseDailyWeight += portionWeight;
          baseDailyNutrition.calories += (product.calories || 0) * weightRatio;
          baseDailyNutrition.proteins += (product.proteins || 0) * weightRatio;
          baseDailyNutrition.fats += (product.fats || 0) * weightRatio;
          baseDailyNutrition.carbs += (product.carbs || 0) * weightRatio;
          
          if (product.isPerishable) {
            perishable.add(product.name);
          }
  
          productUsage[product.id] = productUsage[product.id] || { name: product.name, weight: 0 };
          productUsage[product.id].weight += portionWeight;
        }
      });
    });
  
    const totalWeight = baseDailyWeight * participantsCount * daysCount;
    const totalNutrition = {
      calories: Math.round(baseDailyNutrition.calories * participantsCount * daysCount),
      proteins: Math.round(baseDailyNutrition.proteins * participantsCount * daysCount),
      fats: Math.round(baseDailyNutrition.fats * participantsCount * daysCount),
      carbs: Math.round(baseDailyNutrition.carbs * participantsCount * daysCount),
    };
  
    const productBreakdown = Object.values(productUsage).map(p => ({
      ...p,
      totalWeight: p.weight * participantsCount * daysCount
    }));
  
    const tripParticipants = allParticipants.filter(p => trip.participants?.includes(p.id));
  
    return {
      totalWeight,
      totalNutrition,
      tripParticipants,
      productBreakdown,
      perishableProducts: Array.from(perishable),
      averageWeightPerPersonPerDay: Math.round(baseDailyWeight),
      averageCaloriesPerPersonPerDay: Math.round(baseDailyNutrition.calories),
    };
};