// src/hooks/useTripDates.ts

import { useState, useEffect } from 'react';
import { addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import type { TripData } from '../types';

// Хук принимает исходные данные и возвращает все необходимое для управления датами
export const useTripDates = (initialData: TripData | null) => {
  // Внутреннее состояние для DatePicker
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  // Внутреннее состояние для количества дней
  const [days, setDays] = useState(initialData?.days || 1);

  // Эффект для инициализации и синхронизации с внешними данными
  useEffect(() => {
    const start = initialData?.startDate ? parseISO(initialData.startDate) : null;
    const end = initialData?.endDate ? parseISO(initialData.endDate) : null;
    setDateRange([start, end]);
    setDays(initialData?.days || 1);
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
