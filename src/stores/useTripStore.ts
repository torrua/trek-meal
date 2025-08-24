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
  updateTrip: (id: number, data: Partial<Trip>) => void; // Partial<Trip> для гибкости
  removeParticipantFromAllTrips: (participantId: number) => void;
  // --- НОВАЯ ФУНКЦИЯ-ПРОВЕРЩИК ---
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
        const tripToDelete = get().trips.find(t => t.id === tripId);
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
          trips: state.trips.map(trip => ({
            ...trip,
            participants: trip.participants.filter(id => id !== participantId),
          })),
        }));
      },

      // --- РЕАЛИЗАЦИЯ ФУНКЦИИ-ПРОВЕРЩИКА ---
      isDishInUse: (dishId: number) => {
        const { trips } = get();
        // Проверяем, есть ли хотя бы один поход, в котором...
        return trips.some(trip =>
          // ...в каком-либо из приемов пищи...
          Object.values(trip.selectedMeals).some(mealPlan =>
            // ...есть хотя бы один элемент, который является блюдом с искомым ID.
            (mealPlan as MealPlanItem[]).some(item =>
              item.type === 'dish' && item.itemId === dishId
            )
          )
        );
      },
    }),
    { name: 'trek-meal-trips' }
  )
);

// Вспомогательную функцию можно оставить здесь или вынести, если она используется где-то еще
export const handleDateChange = (formData: TripData, field: string, value: any): TripData => {
  const newFormData = { ...formData, [field]: value };
  if (field === 'startDate' && newFormData.days > 0) {
    newFormData.endDate = calculateEndDate(value, newFormData.days);
  } else if (field === 'days' && newFormData.startDate) {
    newFormData.endDate = calculateEndDate(newFormData.startDate, Number(value));
  } else if ((field === 'startDate' || field === 'endDate') && newFormData.startDate && newFormData.endDate) {
    newFormData.days = calculateDays(newFormData.startDate, newFormData.endDate);
  }
  return newFormData;
};

export default useTripStore;