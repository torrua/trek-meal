import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { calculateDays, calculateEndDate } from '../utils';

const useTripStore = create(
  persist(
    (set, get) => ({
      trips: [],

      // --- ОСНОВНЫЕ ДЕЙСТВИЯ С ПОХОДАМИ ---
      addTrip: (tripData) => {
        const newTrip = {
          ...tripData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          status: 'planning',
          selectedMeals: {}, // План питания изначально пуст
        };
        set((state) => ({ trips: [...state.trips, newTrip] }));
        toast.success(`Поход "${newTrip.name}" создан!`);
        return newTrip; // Возвращаем поход, чтобы можно было сразу перейти на его страницу
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
        // Для этого действия уведомление не нужно, т.к. оно вызывается постоянно при планировании
      },

      // --- ДЕЙСТВИЯ ДЛЯ ВЗАИМОДЕЙСТВИЯ С ДРУГИМИ СТОРАМИ ---
      // Эти методы будут вызываться из useParticipantStore и useProductStore
      
      removeParticipantFromAllTrips: (participantId) => {
        set((state) => ({
          trips: state.trips.map(trip => ({
            ...trip,
            participants: trip.participants.filter(id => id !== participantId),
          })),
        }));
        console.log(`Участник с ID ${participantId} удален из всех походов.`);
      },

      // TODO: Реализовать, когда понадобится
      // removeProductFromAllTrips: (productId) => { ... }
    }),
    {
      name: 'trek-meal-trips',
    }
  )
);

// --- Вспомогательные функции для формы ---
export const handleDateChange = (formData, field, value) => {
  const newFormData = { ...formData, [field]: value };
  if (field === 'startDate' && newFormData.days > 0) {
    newFormData.endDate = calculateEndDate(value, newFormData.days);
  } else if (field === 'days' && newFormData.startDate) {
    newFormData.endDate = calculateEndDate(newFormData.startDate, value);
  } else if ((field === 'startDate' || field === 'endDate') && newFormData.startDate && newFormData.endDate) {
    newFormData.days = calculateDays(newFormData.startDate, newFormData.endDate);
  }
  return newFormData;
};


export default useTripStore;