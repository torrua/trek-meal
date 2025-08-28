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
}

const useParticipantStore = create<ParticipantState>()(
  persist(
    (set, get) => ({
      participants: [],

      addParticipant: (participantData) => {
        if (!participantData.name.trim()) {
          toast.error('Имя участника не может быть пустым.');
          return;
        }

        // Устанавливаем значения по умолчанию для новых полей
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
          participants: state.participants.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updatedData,
                  experienceLevel: updatedData.experienceLevel || 'beginner',
                  phone: updatedData.phone || '',
                  email: updatedData.email || '',
                  birthDate: updatedData.birthDate || '',
                }
              : p
          ),
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
      // Миграция для существующих данных
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Добавляем новые поля к существующим участникам
          if (persistedState.participants) {
            persistedState.participants = persistedState.participants.map((p: any) => ({
              ...p,
              experienceLevel: p.experienceLevel || 'beginner',
              phone: p.phone || '',
              email: p.email || '',
              birthDate: p.birthDate || '',
            }));
          }
        }
        return persistedState;
      },
      version: 1,
    }
  )
);

export default useParticipantStore;
