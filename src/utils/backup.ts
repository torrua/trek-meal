// src/utils/backup.ts

import { toast } from 'react-hot-toast';
import useParticipantStore from '../stores/useParticipantStore';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import useCategoryStore from '../stores/useCategoryStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useMealTypesStore from '../stores/useMealTypesStore';
import type {
  Participant,
  Trip,
  Product,
  Dish,
  Equipment,
  EquipmentCategory,
  MealType,
  Category,
} from '../types';

interface BackupMetadata {
  version: string;
  createdAt: string;
  appVersion: string;
  totalRecords: number;
  breakdown: {
    participants: number;
    trips: number;
    products: number;
    dishes: number;
    categories: number;
    equipment: number;
    equipmentCategories: number;
    mealTypes: number;
  };
}

/**
 * Создает полный снимок всех данных приложения и экспортирует их в JSON файл.
 * Включает все доступные хранилища, метаданные и статистику.
 */
export const exportDataToJson = () => {
  try {
    // Собираем данные из всех хранилищ
    const participants = useParticipantStore.getState().participants;
    const trips = useTripStore.getState().trips;
    const products = useProductStore.getState().products;
    const dishes = useDishStore.getState().dishes;
    const categories = useCategoryStore.getState().categories;
    const equipment = useEquipmentStore.getState().equipment;
    const equipmentCategories = useEquipmentCategoryStore.getState().categories;
    const mealTypes = useMealTypesStore.getState().mealTypes;
    const theme = 'light';

    // Создаем метаданные для резервной копии
    const totalRecords =
      participants.length +
      trips.length +
      products.length +
      dishes.length +
      categories.length +
      equipment.length +
      equipmentCategories.length +
      mealTypes.length;

    const metadata: BackupMetadata = {
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      appVersion: 'Trek Meal Pro',
      totalRecords,
      breakdown: {
        participants: participants.length,
        trips: trips.length,
        products: products.length,
        dishes: dishes.length,
        categories: categories.length,
        equipment: equipment.length,
        equipmentCategories: equipmentCategories.length,
        mealTypes: mealTypes.length,
      },
    };

    // Полный снимок данных
    const dataToExport = {
      _metadata: metadata,
      data: {
        participants,
        trips,
        products,
        dishes,
        categories,
        equipment,
        equipmentCategories,
        mealTypes,
        settings: {
          theme,
        },
      },
      // Для обратной совместимости с предыдущими версиями
      participants,
      trips,
      products,
      dishes,
      categories,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `trek-meal-complete-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Полная резервная копия создана! (${totalRecords} записей)`, {
      duration: 4000,
    });
  } catch (error) {
    console.error('Ошибка при создании резервной копии:', error);
    toast.error('Произошла ошибкашибка при создании резервной копии.');
  }
};

/**
 * Загружает и применяет данные из JSON файла во все хранилища.
 * @param file - JSON файл для импорта.
 */
export const importDataFromJson = (file: File) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const jsonString = event.target?.result;
      if (typeof jsonString !== 'string') {
        throw new Error('Не удалось прочитать файл.');
      }
      const data = JSON.parse(jsonString);

      // Определяем тип резервной копии (новый формат или старый)
      const isNewFormat = data._metadata && data.data;
      let importData;

      if (isNewFormat) {
        // Новый формат с метаданными
        importData = data.data;
        console.log('Импорт резервной копии:', data._metadata);
        toast.success(
          `Найдена резервная копия v${data._metadata.version} (${data._metadata.totalRecords} записей)`
        );
      } else {
        // Старый формат - обратная совместимость
        importData = data;
        const requiredKeys = ['participants', 'trips', 'products', 'dishes', 'categories'];
        const hasAllKeys = requiredKeys.every((key) => key in data && Array.isArray(data[key]));

        if (!hasAllKeys) {
          throw new Error('Файл имеет неверную структуру.');
        }
      }

      // Применяем данные в сторы с безопасными значениями по умолчанию
      useParticipantStore.setState({
        participants: Array.isArray(importData.participants) ? importData.participants : [],
      });
      useTripStore.setState({
        trips: Array.isArray(importData.trips) ? importData.trips : [],
      });
      useProductStore.setState({
        products: Array.isArray(importData.products) ? importData.products : [],
      });
      useDishStore.setState({
        dishes: Array.isArray(importData.dishes) ? importData.dishes : [],
      });
      useCategoryStore.setState({
        categories: Array.isArray(importData.categories) ? importData.categories : [],
      });

      // Импорт новых данных (если есть)
      if (isNewFormat) {
        if (Array.isArray(importData.equipment)) {
          useEquipmentStore.setState({ equipment: importData.equipment });
        }
        if (Array.isArray(importData.equipmentCategories)) {
          useEquipmentCategoryStore.setState({ categories: importData.equipmentCategories });
        }
        if (Array.isArray(importData.mealTypes)) {
          useMealTypesStore.setState({ mealTypes: importData.mealTypes });
        }
        // Theme import ignored in light-only mode
      }

      const recordCount =
        (importData.participants?.length || 0) +
        (importData.trips?.length || 0) +
        (importData.products?.length || 0) +
        (importData.dishes?.length || 0) +
        (importData.categories?.length || 0) +
        (importData.equipment?.length || 0) +
        (importData.equipmentCategories?.length || 0) +
        (importData.mealTypes?.length || 0);

      toast.success(
        `Данные успешно импортированы! (${recordCount} записей) Страница будет перезагружена.`,
        {
          duration: 4000,
        }
      );

      // Перезагрузка страницы для чистого применения состояния
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Ошибка при импорте данных:', error);
      toast.error(
        `Ошибка импорта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      );
    }
  };
  reader.onerror = () => {
    toast.error('Не удалось прочитать файл.');
  };
  reader.readAsText(file);
};

/**
 * Экспортирует данные одного участника в JSON файл.
 * @param participant - Объект участника для экспорта.
 */
export const exportParticipantToJson = (participant: Participant) => {
  try {
    const jsonString = JSON.stringify(participant, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    // Создаем безопасное имя файла
    const safeName = participant.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `participant-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные участника "${participant.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных участника:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одного похода в JSON файл.
 * @param trip - Объект похода для экспорта.
 */
export const exportTripToJson = (trip: Trip) => {
  try {
    const jsonString = JSON.stringify(trip, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = trip.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `trip-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные похода "${trip.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных похода:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одного продукта в JSON файл.
 * @param product - Объект продукта для экспорта.
 */
export const exportProductToJson = (product: Product) => {
  try {
    const jsonString = JSON.stringify(product, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = product.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `product-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные продукта "${product.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных продукта:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одного блюда в JSON файл.
 * @param dish - Объект блюда для экспорта.
 */
export const exportDishToJson = (dish: Dish) => {
  try {
    const jsonString = JSON.stringify(dish, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = dish.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `dish-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные блюда "${dish.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных блюда:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одного снаряжения в JSON файл.
 * @param equipment - Объект снаряжения для экспорта.
 */
export const exportEquipmentToJson = (equipment: Equipment) => {
  try {
    const jsonString = JSON.stringify(equipment, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = equipment.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `equipment-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные снаряжения "${equipment.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных снаряжения:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одной категории снаряжения в JSON файл.
 * @param category - Объект категории снаряжения для экспорта.
 */
export const exportEquipmentCategoryToJson = (category: EquipmentCategory) => {
  try {
    const jsonString = JSON.stringify(category, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = category.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `equipment-category-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные категории снаряжения "${category.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных категории снаряжения:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одного типа приема пищи в JSON файл.
 * @param mealType - Объект типа приема пищи для экспорта.
 */
export const exportMealTypeToJson = (mealType: MealType) => {
  try {
    const jsonString = JSON.stringify(mealType, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = mealType.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `meal-type-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные типа приема пищи "${mealType.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных типа приема пищи:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует данные одной категории в JSON файл.
 * @param category - Объект категории для экспорта.
 */
export const exportCategoryToJson = (category: Category) => {
  try {
    const jsonString = JSON.stringify(category, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const safeName = category.name.replace(/\s+/g, '-').toLowerCase();
    a.download = `category-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Данные категории "${category.name}" экспортированы!`);
  } catch (error) {
    console.error('Ошибка при экспорте данных категории:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные походы в JSON файл.
 * @param trips - Массив походов для экспорта.
 */
export const exportBulkTripsToJson = (trips: Trip[]) => {
  try {
    const jsonString = JSON.stringify(trips, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `trips-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${trips.length} походов!`);
  } catch (error) {
    console.error('Ошибка при экспорте походов:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранных участников в JSON файл.
 * @param participants - Массив участников для экспорта.
 */
export const exportBulkParticipantsToJson = (participants: Participant[]) => {
  try {
    const jsonString = JSON.stringify(participants, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `participants-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${participants.length} участников!`);
  } catch (error) {
    console.error('Ошибка при экспорте участников:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные продукты в JSON файл.
 * @param products - Массив продуктов для экспорта.
 */
export const exportBulkProductsToJson = (products: Product[]) => {
  try {
    const jsonString = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `products-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${products.length} продуктов!`);
  } catch (error) {
    console.error('Ошибка при экспорте продуктов:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные блюда в JSON файл.
 * @param dishes - Массив блюд для экспорта.
 */
export const exportBulkDishesToJson = (dishes: Dish[]) => {
  try {
    const jsonString = JSON.stringify(dishes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `dishes-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${dishes.length} блюд!`);
  } catch (error) {
    console.error('Ошибка при экспорте блюд:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранное снаряжение в JSON файл.
 * @param equipment - Массив снаряжения для экспорта.
 */
export const exportBulkEquipmentToJson = (equipment: Equipment[]) => {
  try {
    const jsonString = JSON.stringify(equipment, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `equipment-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${equipment.length} единиц снаряжения!`);
  } catch (error) {
    console.error('Ошибка при экспорте снаряжения:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные категории в JSON файл.
 * @param categories - Массив категорий для экспорта.
 */
export const exportBulkCategoriesToJson = (categories: Category[]) => {
  try {
    const jsonString = JSON.stringify(categories, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `categories-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${categories.length} категорий!`);
  } catch (error) {
    console.error('Ошибка при экспорте категорий:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные категории снаряжения в JSON файл.
 * @param categories - Массив категорий снаряжения для экспорта.
 */
export const exportBulkEquipmentCategoriesToJson = (categories: EquipmentCategory[]) => {
  try {
    const jsonString = JSON.stringify(categories, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `equipment-categories-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${categories.length} категорий снаряжения!`);
  } catch (error) {
    console.error('Ошибка при экспорте категорий снаряжения:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};

/**
 * Экспортирует выбранные типы приемов пищи в JSON файл.
 * @param mealTypes - Массив типов приемов пищи для экспорта.
 */
export const exportBulkMealTypesToJson = (mealTypes: MealType[]) => {
  try {
    const jsonString = JSON.stringify(mealTypes, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `meal-types-bulk-export-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${mealTypes.length} типов приемов пищи!`);
  } catch (error) {
    console.error('Ошибка при экспорте типов приемов пищи:', error);
    toast.error('Произошла ошибка при экспорте.');
  }
};
