// src/stores/useTripStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import type { Trip, TripData, MealPlanItem } from '../types';
import useMealTypesStore from './useMealTypesStore';

interface TripState {
  trips: Trip[];
  addTrip: (data: TripData) => Trip | undefined;
  deleteTrip: (id: number) => void;
  updateTrip: (id: number, data: Partial<Trip>) => void;
  removeParticipantFromAllTrips: (participantId: number) => void;
  isDishInUse: (dishId: number) => boolean;
  getTripsUsingDish: (dishId: number) => Trip[];
  addParticipantsToTrip: (tripId: number, participantIds: number[]) => void;
  removeParticipantFromTrip: (tripId: number, participantId: number) => void;
  // New meal management functions
  addMealToDay: (tripId: number, day: number, mealTypeId: number) => void;
  removeMealFromDay: (tripId: number, day: number, mealTypeId: number) => void;
  updateDayMeals: (tripId: number, day: number, mealTypeIds: number[]) => void;
  reorderMealsInDay: (tripId: number, day: number, fromIndex: number, toIndex: number) => void;
  // Migration helper
  getMigratedTrips: () => Trip[];
}

const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],

      removeParticipantFromTrip: (tripId, participantId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? { ...t, participants: t.participants.filter((id) => id !== participantId) }
              : t
          ),
        }));
        toast.success(`Участник удален из похода "${trip.name}"`);
      },

      addParticipantsToTrip: (tripId, participantIds) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const newParticipants = [...new Set([...t.participants, ...participantIds])];
              return { ...t, participants: newParticipants };
            }
            return t;
          }),
        }));
        // --- ИЗМЕНЕНИЕ: Более умное уведомление ---
        const count = participantIds.length;
        if (count === 1) {
          toast.success(`Участник добавлен в поход "${trip.name}"`);
        } else {
          toast.success(`${count} участников добавлено в поход "${trip.name}"`);
        }
      },

      addTrip: (tripData) => {
        // Initialize dayMeals with default meal structure if not provided
        const defaultDayMeals: { [dayNumber: string]: number[] } = {};
        for (let day = 1; day <= tripData.days; day++) {
          // Default to standard 3 meals per day (IDs 1, 2, 3 from meal types store)
          defaultDayMeals[day.toString()] = [1, 2, 3]; // Завтрак, Обед, Ужин
        }

        const newTrip: Trip = {
          ...tripData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: 'planning',
          selectedMeals: {},
          dayMeals: defaultDayMeals,
          // Keep mealsPerDay for backward compatibility
          mealsPerDay: tripData.mealsPerDay || 3,
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

      isDishInUse: (dishId) => {
        const { trips } = get();
        return trips.some((trip) =>
          Object.values(trip.selectedMeals).some((mealPlan) =>
            (mealPlan as MealPlanItem[]).some(
              (item) => item.type === 'dish' && item.itemId === dishId
            )
          )
        );
      },

      getTripsUsingDish: (dishId) => {
        const { trips } = get();
        return trips.filter((trip) =>
          Object.values(trip.selectedMeals).some((mealPlan) =>
            (mealPlan as MealPlanItem[]).some(
              (item) => item.type === 'dish' && item.itemId === dishId
            )
          )
        );
      },

      // New meal management functions
      addMealToDay: (tripId, day, mealTypeId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        const currentMeals = trip.dayMeals[dayKey] || [];

        // Check if meal type is repeatable or not already added
        const { mealTypes } = useMealTypesStore.getState();
        const mealType = mealTypes.find((mt) => mt.id === mealTypeId);
        if (!mealType?.repeatable && currentMeals.includes(mealTypeId)) {
          toast.error('Этот прием пищи уже добавлен в день.');
          return;
        }

        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  dayMeals: {
                    ...t.dayMeals,
                    [dayKey]: [...currentMeals, mealTypeId],
                  },
                }
              : t
          ),
        }));
        toast.success('Прием пищи добавлен.');
      },

      removeMealFromDay: (tripId, day, mealTypeId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        const currentMeals = trip.dayMeals[dayKey] || [];

        // Remove associated meal plan items when removing a meal
        const updatedSelectedMeals = { ...trip.selectedMeals };
        const mealId = `${day}-${mealTypeId}`;
        if (updatedSelectedMeals[mealId]) {
          delete updatedSelectedMeals[mealId];
        }

        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  dayMeals: {
                    ...t.dayMeals,
                    [dayKey]: currentMeals.filter((id) => id !== mealTypeId),
                  },
                  selectedMeals: updatedSelectedMeals,
                }
              : t
          ),
        }));
        toast.success('Прием пищи удален.');
      },

      updateDayMeals: (tripId, day, mealTypeIds) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  dayMeals: {
                    ...t.dayMeals,
                    [dayKey]: mealTypeIds,
                  },
                }
              : t
          ),
        }));
      },

      reorderMealsInDay: (tripId, day, fromIndex, toIndex) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        const currentMeals = trip.dayMeals[dayKey] || [];
        const reorderedMeals = arrayMove(currentMeals, fromIndex, toIndex);

        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  dayMeals: {
                    ...t.dayMeals,
                    [dayKey]: reorderedMeals,
                  },
                }
              : t
          ),
        }));
      },

      // Migration helper to ensure all trips have dayMeals
      getMigratedTrips: () => {
        const { trips } = get();
        return trips.map((trip) => {
          if (!trip.dayMeals) {
            const dayMeals: { [dayNumber: string]: number[] } = {};
            for (let day = 1; day <= trip.days; day++) {
              // Default to standard meals based on mealsPerDay
              const mealCount = trip.mealsPerDay || 3;
              if (mealCount === 3) {
                dayMeals[day.toString()] = [1, 2, 3]; // Завтрак, Обед, Ужин
              } else if (mealCount === 4) {
                dayMeals[day.toString()] = [1, 2, 3, 4]; // Add snack
              } else if (mealCount === 5) {
                dayMeals[day.toString()] = [1, 2, 3, 4, 5]; // Full set
              } else {
                // Default to basic 3 meals
                dayMeals[day.toString()] = [1, 2, 3];
              }
            }
            return { ...trip, dayMeals };
          }
          return trip;
        });
      },
    }),
    { name: 'trek-meal-trips' }
  )
);

export default useTripStore;
