// src/utils/backup.ts

import { toast } from 'react-hot-toast';
import useParticipantStore from '../stores/useParticipantStore';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import useCategoryStore from '../stores/useCategoryStore';
import type { Participant } from '../types';

/**
 * Собирает данные из всех хранилищ и экспортирует их в JSON файл.
 */
export const exportDataToJson = () => {
  try {
    const dataToExport = {
      participants: useParticipantStore.getState().participants,
      trips: useTripStore.getState().trips,
      products: useProductStore.getState().products,
      dishes: useDishStore.getState().dishes,
      categories: useCategoryStore.getState().categories,
      // Добавьте сюда другие сторы при необходимости
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `trek-meal-pro-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Данные успешно экспортированы!');
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
    toast.error('Произошла ошибка при экспорте.');
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

      // Валидация данных (проверяем наличие ключей)
      const requiredKeys = ['participants', 'trips', 'products', 'dishes', 'categories'];
      const hasAllKeys = requiredKeys.every((key) => key in data && Array.isArray(data[key]));

      if (!hasAllKeys) {
        throw new Error('Файл имеет неверную структуру.');
      }

      // Применяем данные в сторы
      useParticipantStore.setState({ participants: data.participants });
      useTripStore.setState({ trips: data.trips });
      useProductStore.setState({ products: data.products });
      useDishStore.setState({ dishes: data.dishes });
      useCategoryStore.setState({ categories: data.categories });

      toast.success('Данные успешно импортированы! Страница будет перезагружена.');

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
