// src/stores/useEquipmentStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Equipment, EquipmentData } from '../types';

interface EquipmentState {
  equipment: Equipment[];
  addEquipment: (data: EquipmentData) => void;
  updateEquipment: (id: number, data: EquipmentData) => void;
  deleteEquipment: (id: number) => void;
  removeCategoryFromEquipment: (categoryId: number) => void;
  isEquipmentInUse: (equipmentId: number) => boolean;
}

const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipment: [],

      addEquipment: (equipmentData) => {
        const trimmedName = equipmentData.name.trim();
        if (!trimmedName) {
          toast.error('Название снаряжения не может быть пустым.');
          return;
        }

        const isDuplicate = get().equipment.some(
          (e) => e.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
          toast.error(`Снаряжение с названием "${trimmedName}" уже существует.`);
          return;
        }

        const newEquipment: Equipment = {
          ...equipmentData,
          name: trimmedName,
          id: Date.now(),
          weight: Number(equipmentData.weight) || 0,
          categoryId: equipmentData.categoryId ? Number(equipmentData.categoryId) : null,
          ownerId: equipmentData.ownerId ? Number(equipmentData.ownerId) : null,
          link: equipmentData.link?.trim() || undefined,
        };
        set((state) => ({ equipment: [...state.equipment, newEquipment] }));
        toast.success(`Снаряжение "${newEquipment.name}" добавлено.`);
      },

      updateEquipment: (id, updatedData) => {
        const trimmedName = updatedData.name.trim();
        if (!trimmedName) {
          toast.error('Название снаряжения не может быть пустым.');
          return;
        }

        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id
              ? {
                  ...e,
                  ...updatedData,
                  name: trimmedName,
                  weight: Number(updatedData.weight) || 0,
                  categoryId: updatedData.categoryId ? Number(updatedData.categoryId) : null,
                  ownerId: updatedData.ownerId ? Number(updatedData.ownerId) : null,
                  link: updatedData.link?.trim() || undefined,
                }
              : e
          ),
        }));
        toast.success(`Снаряжение "${trimmedName}" обновлено.`);
      },

      deleteEquipment: (id) => {
        const isUsed = get().isEquipmentInUse(id);

        if (isUsed) {
          toast.error(
            'Невозможно удалить снаряжение, так как оно используется в походах или назначено участникам.',
            { duration: 5000 }
          );
          return;
        }

        const equipmentToDelete = get().equipment.find((e) => e.id === id);
        if (equipmentToDelete) {
          set((state) => ({
            equipment: state.equipment.filter((e) => e.id !== id),
          }));
          toast.success(`Снаряжение "${equipmentToDelete.name}" удалено.`);
        }
      },

      removeCategoryFromEquipment: (categoryId) => {
        set((state) => ({
          equipment: state.equipment.map((equipment) =>
            equipment.categoryId === categoryId ? { ...equipment, categoryId: null } : equipment
          ),
        }));
      },

      // Check if equipment is in use by participants or trips
      isEquipmentInUse: (equipmentId: number) => {
        // This will be expanded when we integrate with participant and trip stores
        // For now, we'll check localStorage directly
        try {
          const participantsData = localStorage.getItem('trek-meal-participants');
          const tripsData = localStorage.getItem('trek-meal-trips');

          if (participantsData) {
            const participants = JSON.parse(participantsData).state?.participants || [];
            if (participants.some((p: any) => p.equipmentIds?.includes(equipmentId))) {
              return true;
            }
          }

          if (tripsData) {
            const trips = JSON.parse(tripsData).state?.trips || [];
            if (
              trips.some(
                (t: any) =>
                  t.requiredEquipmentIds?.includes(equipmentId) ||
                  Object.values(t.assignedEquipment || {}).some((ids: any) =>
                    ids?.includes(equipmentId)
                  )
              )
            ) {
              return true;
            }
          }
        } catch (error) {
          console.warn('Error checking equipment usage:', error);
        }

        return false;
      },
    }),
    { name: 'trek-meal-equipment' }
  )
);

export default useEquipmentStore;
