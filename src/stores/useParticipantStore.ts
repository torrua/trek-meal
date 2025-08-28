// src/stores/useParticipantStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useTripStore from './useTripStore';
import type { Participant, ParticipantData } from '../types';

interface ParticipantState {
  participants: Participant[];
  addParticipant: (data: ParticipantData) => void;
  updateParticipant: (id: number, data: ParticipantData) => void;
  deleteParticipant: (id: number) => void;
  cloneParticipant: (id: number) => void;
}

// Улучшенная типизация для миграции
type PersistedState = {
  participants: Partial<Participant>[];
};

const useParticipantStore = create<ParticipantState>()(
  persist(
    (set, get) => ({
      participants: [],

      cloneParticipant: (id) => {
        const original = get().participants.find((p) => p.id === id);
        if (!original) {
          toast.error('Не удалось найти участника для клонирования.');
          return;
        }
        const clonedParticipant: Participant = {
          ...original,
          id: Date.now(),
          name: `${original.name} (копия)`,
        };
        set((state) => ({
          participants: [...state.participants, clonedParticipant],
        }));
        toast.success(`Участник "${original.name}" клонирован.`);
      },

      addParticipant: (participantData) => {
        if (!participantData.name.trim()) {
          toast.error('Имя участника не может быть пустым.');
          return;
        }
        const newParticipant: Participant = {
          ...participantData,
          id: Date.now(),
          experienceLevel: participantData.experienceLevel || 'beginner',
          phone: participantData.phone || '',
          email: participantData.email || '',
          birthDate: participantData.birthDate || '',
        };
        set((state) => ({
          participants: [...state.participants, newParticipant],
        }));
        toast.success(`Участник "${newParticipant.name}" добавлен!`);
      },

      updateParticipant: (id, updatedData) => {
        if (!updatedData.name.trim()) {
          toast.error('Имя участника не может быть пустым.');
          return;
        }
        set((state) => ({
          participants: state.participants.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
        }));
        toast.success(`Данные участника "${updatedData.name}" обновлены.`);
      },

      deleteParticipant: (id) => {
        const participantToDelete = get().participants.find((p) => p.id === id);
        if (!participantToDelete) return;
        useTripStore.getState().removeParticipantFromAllTrips(id);
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        }));
        toast.error(`Участник "${participantToDelete.name}" удален.`);
      },
    }),
    {
      name: 'trek-meal-participants',
      migrate: (persistedState, version) => {
        const state = persistedState as PersistedState;
        if (version === 0) {
          if (state.participants) {
            state.participants = state.participants.map((p) => ({
              ...p,
              experienceLevel: p.experienceLevel || 'beginner',
              phone: p.phone || '',
              email: p.email || '',
              birthDate: p.birthDate || '',
            }));
          }
        }
        return state as ParticipantState;
      },
      version: 1,
    }
  )
);

export default useParticipantStore;
