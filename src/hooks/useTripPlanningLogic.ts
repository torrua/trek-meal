import { useState, useMemo } from 'react';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useTripStore from '../stores/useTripStore';

export const useTripPlanningLogic = (tripId?: string) => {
  const numericTripId = tripId ? parseInt(tripId, 10) : undefined;
  const { getMigratedTrips, reorderMealsInDay } = useTripStore();

  // Получаем поход
  const trip = useMemo(
    () => getMigratedTrips().find((t) => t.id === numericTripId),
    [numericTripId, getMigratedTrips]
  );

  // Локальные состояния UI
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [expandedDishes, setExpandedDishes] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<string[]>(['day-1']);

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent, day: number) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!trip || !over || active.id === over.id) return;

    const dayMeals = trip.dayMeals[day] || [];
    const oldIndex = dayMeals.findIndex((m) => m.instanceId === active.id);
    const newIndex = dayMeals.findIndex((m) => m.instanceId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderMealsInDay(trip.id, day, oldIndex, newIndex);
    }
  };

  const toggleDishExpansion = (instanceId: string) => {
    setExpandedDishes((prev) => ({ ...prev, [instanceId]: !prev[instanceId] }));
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return {
    trip,
    sensors,
    activeDragId,
    expandedDishes,
    openSections,
    handleDragStart,
    handleDragEnd,
    toggleDishExpansion,
    toggleSection,
    setActiveDragId, // на случай отмены
  };
};
