// src/stores/useTripStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Trip, TripData, MealPlanItem } from '../types';

interface TripState {
  trips: Trip[];
  addTrip: (data: TripData) => Trip;
  deleteTrip: (id: number) => void;
  updateTrip: (id: number, data: Partial<Trip>) => void;
  removeParticipantFromAllTrips: (participantId: number) => void;
  isDishInUse: (dishId: number) => boolean;
  addParticipantsToTrip: (tripId: number, participantIds: number[]) => void; // Новая функция
}

const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],

      addParticipantsToTrip: (tripId, participantIds) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) {
          toast.error('Поход не найден.');
          return;
        }

        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id === tripId) {
              const newParticipants = [...t.participants];
              participantIds.forEach((pId) => {
                if (!newParticipants.includes(pId)) {
                  newParticipants.push(pId);
                }
              });
              return { ...t, participants: newParticipants };
            }
            return t;
          }),
        }));
        toast.success(`Участники добавлены в поход "${trip.name}"`);
      },

      addTrip: (tripData) => {
        // ... без изменений
      },

      deleteTrip: (tripId) => {
        // ... без изменений
      },

      updateTrip: (tripId, updatedData) => {
        // ... без изменений
      },

      removeParticipantFromAllTrips: (participantId) => {
        // ... без изменений
      },

      isDishInUse: (dishId: number) => {
        // ... без изменений
      },
    }),
    { name: 'trek-meal-trips' }
  )
);

export default useTripStore;
