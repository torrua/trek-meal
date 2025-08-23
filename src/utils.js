// --- Утилитарные функции ---

/**
 * Возвращает название приема пищи по его номеру.
 * @param {number} mealNumber - Порядковый номер приема пищи (начиная с 1).
 * @param {number} totalMeals - Общее количество приемов пищи в день.
 * @returns {string} Название приема пищи.
 */
export const getMealName = (mealNumber, totalMeals) => {
    const names = {
      3: ['Завтрак', 'Обед', 'Ужин'],
      4: ['Завтрак', 'Перекус', 'Обед', 'Ужин'],
      5: ['Завтрак', 'Перекус', 'Обед', 'Полдник', 'Ужин'],
    };
    return (names[totalMeals] && names[totalMeals][mealNumber - 1]) || `Прием пищи ${mealNumber}`;
  };
  
  /**
   * Форматирует строку с датой в удобочитаемый вид.
   * @param {string} dateString - Строка с датой (например, '2025-08-23').
   * @returns {string} Отформатированная дата.
   */
  export const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };
  
  /**
   * Возвращает правильное склонение слова в зависимости от числа.
   * @param {number} number - Число.
   * @param {Array<string>} words - Массив из трех слов (например, ['день', 'дня', 'дней']).
   * @returns {string} Слово в правильном склонении.
   */
  export const pluralize = (number, words) => {
    const cases = [2, 0, 1, 1, 1, 2];
    const num = Math.abs(number);
    return words[
      (num % 100 > 4 && num % 100 < 20)
        ? 2
        : cases[Math.min(num % 10, 5)]
    ];
  };
  
  /**
   * Рассчитывает количество дней между двумя датами.
   * @param {string} startDate - Дата начала.
   * @param {string} endDate - Дата окончания.
   * @returns {number} Количество дней.
   */
  export const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 1;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };
  
  /**
   * Рассчитывает дату окончания на основе даты начала и количества дней.
   * @param {string} startDate - Дата начала.
   * @param {number} days - Количество дней.
   * @returns {string} Дата окончания в формате YYYY-MM-DD.
   */
  export const calculateEndDate = (startDate, days) => {
    if (!startDate || !days || days < 1) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(days, 10) - 1);
    return end.toISOString().split('T')[0];
  };
  
  /**
   * ЕДИНЫЙ ИСТОЧНИК ПРАВДЫ: Рассчитывает все ключевые показатели похода.
   * @param {object} trip - Объект похода.
   * @param {Array} allProducts - Массив всех доступных продуктов.
   * @param {Array} allParticipants - Массив всех доступных участников.
   * @returns {object} - Объект с полной сводкой по походу.
   */
  export const calculateTripSummary = (trip, allProducts, allParticipants = []) => {
    if (!trip || !allProducts) {
      return {
        totalWeight: 0,
        totalNutrition: { calories: 0, proteins: 0, fats: 0, carbs: 0 },
        tripParticipants: [],
        perishableProducts: [],
        averageWeightPerPersonPerDay: 0,
        averageCaloriesPerPersonPerDay: 0,
      };
    }
  
    const participantsCount = trip.participants?.length || 1;
    const daysCount = trip.days || 1;
    
    let baseDailyWeight = 0;
    const baseDailyNutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
    const perishable = new Set();
    const productUsage = {};
  
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
  
          if (!productUsage[product.id]) {
            productUsage[product.id] = { name: product.name, weight: 0 };
          }
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