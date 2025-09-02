// src/stores/useTripStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Trip, TripData, MealPlanItem } from '../types';

interface TripState {
  trips: Trip[];
  addTrip: (data: TripData) => Trip | undefined;
  deleteTrip: (id: number) => void;
  updateTrip: (id: number, data: Partial<Trip>) => void;
  removeParticipantFromAllTrips: (participantId: number) => void;
  isDishInUse: (dishId: number) => boolean;
  addParticipantsToTrip: (tripId: number, participantIds: number[]) => void;
  removeParticipantFromTrip: (tripId: number, participantId: number) => void; // --- НОВАЯ ФУНКЦИЯ ---
}

const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],

      // --- НОВАЯ ФУНКЦИЯ ---
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
        toast.success(`Участники добавлены в поход "${trip.name}"`);
      },

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
    }),
    { name: 'trek-meal-trips' }
  )
);

export default useTripStore;
