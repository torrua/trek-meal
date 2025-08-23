
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
 * @param {string} dateString - Дата в формате строки (например, "2025-08-23").
 * @returns {string} Отформатированная дата или "Не указано".
 */
export const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
};

/**
 * Возвращает правильную форму слова в зависимости от числа (для русского языка).
 * @param {number} number - Число.
 * @param {Array<string>} words - Массив из трех форм слова (например, ['день', 'дня', 'дней']).
 * @returns {string} Правильная форма слова.
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
 * Корректно рассчитывает общий вес продуктов для похода.
 * @param {object} trip - Объект похода.
 * @param {Array} products - Массив всех доступных продуктов.
 * @returns {number} - Общий вес в граммах.
 */
export const calculateTotalWeight = (trip, products) => {
    if (!trip || !trip.selectedMeals || !products || products.length === 0) {
        return 0;
    }
    
    const participantsCount = trip.participants?.length || 1;
    const daysCount = trip.days || 1;
    let baseDailyWeight = 0; // Вес на одного человека в день

    Object.values(trip.selectedMeals).forEach(mealProducts => {
        mealProducts.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                baseDailyWeight += item.weight || 0;
            }
        });
    });

    return baseDailyWeight * participantsCount * daysCount;
};