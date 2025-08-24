// src/stores/useTripStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { calculateDays, calculateEndDate } from '../utils';
import type { Trip, TripData, MealPlanItem } from '../types';

interface TripState {
  trips: Trip[];
  addTrip: (data: TripData) => Trip;
  deleteTrip: (id: number) => void;
  updateTrip: (id: number, data: Partial<Trip>) => void;
  removeParticipantFromAllTrips: (participantId: number) => void;
  isDishInUse: (dishId: number) => boolean;
}

const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],

      addTrip: (tripData) => {
        const newTrip: Trip = {
          ...tripData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: 'planning',
          selectedMeals: {},
        };
        set((state) => ({ trips: [...state.trips, newTrip] }));
        toast.success(`Поход "${newTrip.name}" создан!`);
        return newTrip;
      },

      deleteTrip: (tripId) => {
        const tripToDelete = get().trips.find((t) => t.id === tripId);
        if (tripToDelete) {
          set((state) => ({
            trips: state.trips.filter((trip) => trip.id !== tripId),
          }));
          toast.error(`Поход "${tripToDelete.name}" удален.`);
        }
      },

      updateTrip: (tripId, updatedData) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId ? { ...trip, ...updatedData } : trip
          ),
        }));
      },

      removeParticipantFromAllTrips: (participantId) => {
        set((state) => ({
          trips: state.trips.map((trip) => ({
            ...trip,
            participants: trip.participants.filter((id) => id !== participantId),
          })),
        }));
      },

      // --- РЕАЛИЗАЦИЯ ФУНКЦИИ-ПРОВЕРЩИКА ---
      isDishInUse: (dishId: number) => {
        const { trips } = get();
        // Проверяем, есть ли хотя бы один поход, в котором...
        return trips.some((trip) =>
          // ...в каком-либо из приемов пищи...
          Object.values(trip.selectedMeals).some((mealPlan) =>
            // ...есть хотя бы один элемент, который является блюдом с искомым ID.
            (mealPlan as MealPlanItem[]).some(
              (item) => item.type === 'dish' && item.itemId === dishId
            )
          )
        );
      },
    }),
    { name: 'trek-meal-trips' }
  )
);

// Вспомогательную функцию можно оставить здесь или вынести, если она используется где-то еще
export const handleDateChange = (
  formData: TripData,
  field: keyof TripData,
  value: unknown
): TripData => {
  // Создаём мутируемую копию для удобства. Будем аккуратно приводить типы ниже.
  const newFormData = { ...formData } as TripData & Record<string, unknown>;
  // Присваиваем новое значение полю (с приведением) через промежуточный Record,
  // чтобы избежать использования `any` и соблюсти проверку типов.
  const _cast = newFormData as unknown as Record<string, TripData[keyof TripData]>;
  _cast[String(field)] = value as TripData[keyof TripData];

  if (field === 'startDate' && typeof newFormData.days === 'number' && newFormData.days > 0) {
    // Ожидаем, что startDate приходит как строка, приводим безопасно
    const start = String(value);
    newFormData.endDate = calculateEndDate(start, newFormData.days);
  } else if (field === 'days' && typeof newFormData.startDate === 'string') {
    // days может прийти как строка из инпута — приводим в number
    const days = Number(value);
    if (!Number.isNaN(days)) {
      newFormData.endDate = calculateEndDate(newFormData.startDate, days);
      newFormData.days = days;
    }
  } else if (
    (field === 'startDate' || field === 'endDate') &&
    typeof newFormData.startDate === 'string' &&
    typeof newFormData.endDate === 'string'
  ) {
    newFormData.days = calculateDays(newFormData.startDate, newFormData.endDate);
  }

  return newFormData;
};

export default useTripStore;
