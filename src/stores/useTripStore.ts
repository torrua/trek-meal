// src/stores/useTripStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { arrayMove } from '@dnd-kit/sortable';
import type { Trip, TripData, MealPlanItem, MealInstance, Meal } from '../types';
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
  addMealToDay: (tripId: number, day: number, meal: Meal) => void;
  removeMealFromDay: (tripId: number, day: number, instanceId: string) => void;
  updateMealInstance: (
    tripId: number,
    day: number,
    instanceId: string,
    data: Partial<Omit<MealInstance, 'mealTypeId' | 'instanceId'>>
  ) => void;
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
        // Initialize dayMeals with default meal structure
        const defaultDayMeals: { [dayNumber: string]: MealInstance[] } = {};
        const { mealTypes } = useMealTypesStore.getState();

        for (let day = 1; day <= tripData.days; day++) {
          // Default to standard 3 meals per day (IDs 1, 2, 3 from meal types store)
          const defaultMealTypes = [1, 2, 3]; // Завтрак, Обед, Ужин
          defaultDayMeals[day.toString()] = defaultMealTypes.map((mealTypeId) => {
            const mealType = mealTypes.find((mt) => mt.id === mealTypeId);
            return {
              instanceId: `${day}-${mealTypeId}-${Date.now()}-${Math.random()}`,
              mealTypeId,
              title: mealType?.name || `Приём пищи ${mealTypeId}`,
            };
          });
        }

        const newTrip: Trip = {
          ...tripData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: 'planning',
          selectedMeals: {},
          dayMeals: defaultDayMeals,
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
      addMealToDay: (tripId, day, meal) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        if (!trip.dayMeals) {
          trip.dayMeals = {};
        }
        if (!trip.dayMeals[dayKey]) {
          trip.dayMeals[dayKey] = [];
        }
        const currentMeals = trip.dayMeals[dayKey];

        const newMealInstance: MealInstance = {
          instanceId: `${day}-${meal.id}-${Date.now()}-${Math.random()}`,
          title: meal.name,
          description: meal.description,
        };

        const newSelectedMeals = { ...trip.selectedMeals };
        newSelectedMeals[newMealInstance.instanceId] = meal.items;

        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  dayMeals: {
                    ...t.dayMeals,
                    [dayKey]: [...currentMeals, newMealInstance],
                  },
                  selectedMeals: newSelectedMeals,
                }
              : t
          ),
        }));
        toast.success(`"${meal.name}" добавлен в день ${day}.`);
      },

      removeMealFromDay: (tripId, day, instanceId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        const dayKey = day.toString();
        const currentMeals = trip.dayMeals[dayKey] || [];
        const mealToRemove = currentMeals.find((m) => m.instanceId === instanceId);

        if (!mealToRemove) return;

        // Remove associated meal plan items when removing a meal
        const updatedSelectedMeals = { ...trip.selectedMeals };
        const mealId = mealToRemove.instanceId; // Use instanceId as the key
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
                    [dayKey]: currentMeals.filter((meal) => meal.instanceId !== instanceId),
                  },
                  selectedMeals: updatedSelectedMeals,
                }
              : t
          ),
        }));
        toast.success(`"${mealToRemove.title}" удален.`);
      },

      updateMealInstance: (tripId, day, instanceId, data) => {
        set((state) => ({
          trips: state.trips.map((trip) => {
            if (trip.id !== tripId) return trip;

            const dayKey = day.toString();
            const dayMeals = trip.dayMeals[dayKey] || [];
            const updatedDayMeals = dayMeals.map((meal) =>
              meal.instanceId === instanceId ? { ...meal, ...data } : meal
            );

            return {
              ...trip,
              dayMeals: {
                ...trip.dayMeals,
                [dayKey]: updatedDayMeals,
              },
            };
          }),
        }));
        toast.success('Приём пищи обновлен.');
      },

      reorderMealsInDay: (tripId, day, fromIndex, toIndex) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return;

        const dayKey = day.toString();
        const currentMeals = trip.dayMeals[dayKey] || [];

        if (
          fromIndex < 0 ||
          fromIndex >= currentMeals.length ||
          toIndex < 0 ||
          toIndex >= currentMeals.length
        ) {
          return;
        }

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

      // Migration helper
      getMigratedTrips: () => {
        const { trips } = get();
        // No longer need mealTypes for this migration
        // const { mealTypes } = useMealTypesStore.getState();

        return trips.map((trip) => {
          // Check if migration is needed based on old structure
          if (
            trip.dayMeals &&
            Object.values(trip.dayMeals).length > 0 &&
            Object.values(trip.dayMeals).some(
              (day) => day.length > 0 && typeof (day[0] as any)?.mealTypeId !== 'undefined'
            )
          ) {
            const newDayMeals: { [dayNumber: string]: MealInstance[] } = {};
            const oldDayMeals = trip.dayMeals || {};
            const newSelectedMeals = { ...trip.selectedMeals };

            for (const dayStr in oldDayMeals) {
              const oldDayMealInstances = oldDayMeals[dayStr] as any[];
              newDayMeals[dayStr] = oldDayMealInstances.map((oldInstance) => {
                const newInstance: MealInstance = {
                  instanceId: oldInstance.instanceId,
                  title: oldInstance.title,
                  description: oldInstance.description,
                };
                // We don't need to migrate selectedMeals as the instanceId should be stable
                return newInstance;
              });
            }
            return { ...trip, dayMeals: newDayMeals, selectedMeals: newSelectedMeals };
          }
          return trip;
        });
      },
    }),
    {
      name: 'trip-storage',
    }
  )
);

export default useTripStore;
