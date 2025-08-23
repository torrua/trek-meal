import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
// import { useTripStore } from './useTripStore'; // Будет добавлено в будущем

const useParticipantStore = create(
  persist(
    (set, get) => ({
      participants: [],
      
      addParticipant: (participantData) => {
        if (!participantData.name.trim()) {
          toast.error("Имя участника не может быть пустым.");
          return;
        }
        
        const newParticipant = { ...participantData, id: Date.now() };
        set((state) => ({
          participants: [...state.participants, newParticipant],
        }));
        toast.success(`Участник "${newParticipant.name}" добавлен!`);
      },

      updateParticipant: (id, updatedData) => {
        if (!updatedData.name.trim()) {
          toast.error("Имя участника не может быть пустым.");
          return;
        }
        
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, ...updatedData } : p
          ),
        }));
        toast.success(`Данные участника "${updatedData.name}" обновлены.`);
      },
      
      deleteParticipant: (id) => {
        const participantToDelete = get().participants.find(p => p.id === id);
        if (!participantToDelete) return;

        useTripStore.getState().removeParticipantFromAllTrips(id);

        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        }));
        toast.success(`Участник "${participantToDelete.name}" удален.`);
      },
    }),
    {
      name: 'trek-meal-participants', // Ключ для localStorage
    }
  )
);

export default useParticipantStore;