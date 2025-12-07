// src/hooks/useTripDates.ts

import { useState, useEffect, useRef } from 'react';
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import type { TripData } from '../types';

// Хук принимает исходные данные и возвращает все необходимое для управления датами
export const useTripDates = (initialData: TripData | null) => {
  // Внутреннее состояние для DatePicker
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // Внутреннее состояние для количества дней
  const [days, setDays] = useState(initialData?.days || 1);

  // Отслеживаем предыдущие значения для сравнения
  const prevDataRef = useRef<{
    startDate?: string;
    endDate?: string;
    days?: number;
  } | null>(null);

  // Эффект для инициализации и синхронизации с внешними данными
  useEffect(() => {
    const currentData = {
      startDate: initialData?.startDate,
      endDate: initialData?.endDate,
      days: initialData?.days,
    };

    // Проверяем, изменились ли данные
    const hasChanged =
      !prevDataRef.current ||
      currentData.startDate !== prevDataRef.current.startDate ||
      currentData.endDate !== prevDataRef.current.endDate ||
      currentData.days !== prevDataRef.current.days;

    if (hasChanged) {
      const start = currentData.startDate ? parseISO(currentData.startDate) : null;
      const end = currentData.endDate ? parseISO(currentData.endDate) : null;
      setDateRange([start, end]);
      setDays(currentData.days || 1);
      prevDataRef.current = currentData;
    }
  }, [initialData?.startDate, initialData?.endDate, initialData?.days]);

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange(dates);
    if (start && end) {
      // +1, так как поход в 1 день имеет start и end в тот же день
      const newDays = differenceInCalendarDays(end, start) + 1;
      setDays(newDays);
    }
  };

  const handleDaysChange = (newDays: number) => {
    const sanitizedDays = Math.max(1, Math.floor(newDays || 1));
    setDays(sanitizedDays);
    const [start] = dateRange;
    if (start) {
      const newEnd = addDays(start, sanitizedDays - 1);
      setDateRange([start, newEnd]);
    }
  };

  // Возвращаем все необходимые данные и обработчики для компонента
  return {
    dateRange,
    days,
    handleDateRangeChange,
    handleDaysChange,
  };
};
