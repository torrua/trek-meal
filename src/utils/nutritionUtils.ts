import type { MealPlanItem, Product, Dish, DishProduct } from '../types';

export interface NutritionResult {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

/**
 * Рассчитывает вес элемента (продукта или блюда).
 * Для продукта берется указанный вес.
 * Для блюда суммируется вес всех ингредиентов.
 */
export const calculateItemWeight = (
  item: MealPlanItem,
  products: Product[], // Не используются для расчета веса продукта, но нужны для сигнатуры, если вес блюда зависит от продуктов
  dishes: Dish[]
): number => {
  if (item.type === 'product') {
    return Number(item.weight || 0);
  } else if (item.type === 'dish') {
    const dish = dishes.find((d) => d.id === item.itemId);
    if (dish) {
      // Суммируем вес всех продуктов в блюде
      return Number(dish.products.reduce((sum, dp) => sum + Number(dp.weight), 0));
    }
  }
  return 0;
};

/**
 * Рассчитывает КБЖУ для отдельного элемента (продукта или блюда)
 * с учетом его веса.
 */
export const calculateItemNutrition = (
  item: MealPlanItem,
  products: Product[],
  dishes: Dish[]
): NutritionResult | null => {
  // 1. Если это Продукт
  if (item.type === 'product') {
    const product = products.find((p) => p.id === item.itemId);
    if (!product) return null;

    // Если вес не указан, считаем для 100г (стандартное отображение),
    // или 0, если логика требует строгого учета. В текущем коде было fallback на 100 или 0.
    // Примем стратегию: если вес есть, считаем пропорцию. Если нет - возвращаем базу (как в коде MealDetail).
    const weight = Number(item.weight || 0);
    const multiplier = weight / 100;

    return {
      calories: Math.round(product.calories * multiplier),
      proteins: Math.round(product.proteins * multiplier * 10) / 10,
      fats: Math.round(product.fats * multiplier * 10) / 10,
      carbs: Math.round(product.carbs * multiplier * 10) / 10,
    };
  }

  // 2. Если это Блюдо
  if (item.type === 'dish') {
    const dish = dishes.find((d) => d.id === item.itemId);
    if (!dish) return null;

    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbs = 0;

    dish.products.forEach((dishProduct: DishProduct) => {
      const product = products.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = Number(dishProduct.weight) / 100;
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

/**
 * Рассчитывает суммарные КБЖУ и вес для всего списка элементов.
 */
export const calculateMealTotals = (items: MealPlanItem[], products: Product[], dishes: Dish[]) => {
  let calories = 0;
  let proteins = 0;
  let fats = 0;
  let carbs = 0;
  let totalWeight = 0;

  items.forEach((item) => {
    // Вес
    totalWeight += calculateItemWeight(item, products, dishes);

    // КБЖУ
    const nutrition = calculateItemNutrition(item, products, dishes);
    if (nutrition) {
      calories += nutrition.calories;
      proteins += nutrition.proteins;
      fats += nutrition.fats;
      carbs += nutrition.carbs;
    }
  });

  return {
    calories: Math.round(calories),
    proteins: Math.round(proteins * 10) / 10,
    fats: Math.round(fats * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    weight: Math.round(totalWeight),
  };
};
