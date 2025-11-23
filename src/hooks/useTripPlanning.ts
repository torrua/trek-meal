import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SingleValue } from 'react-select';

import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import { useMealStore } from '../stores/useMealStore';
import type {
  Product,
  Dish,
  DishData,
  MealPlanItem,
  SubmitDishAction,
  MealInstance,
} from '../types';

type SelectMealOption = { value: string; label: string };
type GroupedMealOption = { label: string; options: SelectMealOption[] };

// Типы состояний для модалок
export type CloningState = {
  instanceId: string;
  dish: Dish;
  day: number;
} | null;

export type EditMealState = {
  day: number;
  meal: MealInstance;
} | null;

export const useTripPlanning = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const numericTripId = tripId ? parseInt(tripId, 10) : undefined;

  // Stores
  const {
    getMigratedTrips,
    updateTrip,
    addMealToDay,
    removeMealFromDay,
    reorderMealsInDay,
    updateMealInstance,
  } = useTripStore();
  const { products } = useProductStore();
  const { dishes, addDish } = useDishStore();
  const { meals: mealTemplates } = useMealStore();

  // Derived Data
  const trip = useMemo(
    () => getMigratedTrips().find((t) => t.id === numericTripId),
    [numericTripId, getMigratedTrips]
  );

  // UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<EditMealState>(null);
  const [cloningState, setCloningState] = useState<CloningState>(null);
  const [expandedDishes, setExpandedDishes] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<string[]>(['day-1']);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Options Builders ---
  const groupedMealOptions: GroupedMealOption[] = useMemo(() => {
    const productOptions = products.map((p) => ({
      value: `product-${p.id}`,
      label: p.name,
    }));
    const dishOptions = dishes.map((d) => ({
      value: `dish-${d.id}`,
      label: d.name,
    }));

    const options = [];
    if (dishOptions.length > 0) options.push({ label: 'Блюда', options: dishOptions });
    if (productOptions.length > 0) options.push({ label: 'Продукты', options: productOptions });

    return options;
  }, [products, dishes]);

  const mealTemplateOptions = useMemo(
    () => mealTemplates.map((t) => ({ value: t.id.toString(), label: t.name })),
    [mealTemplates]
  );

  // --- Handlers ---

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

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

  const handleAddTemplateToDay = (day: number, templateId: string) => {
    if (!trip || !templateId) return;
    const template = mealTemplates.find((t) => t.id === parseInt(templateId, 10));
    if (template) addMealToDay(trip.id, day, template);
  };

  const handleMealItemAdd = (
    day: number,
    mealInstanceId: string,
    selectedOption: SingleValue<SelectMealOption>
  ) => {
    if (!trip || !selectedOption?.value) return;
    const [type, idStr] = selectedOption.value.split('-');
    const itemId = parseInt(idStr, 10);
    if (!type || isNaN(itemId)) return;

    let newItem: MealPlanItem;
    if (type === 'dish') {
      if (!dishes.find((d) => d.id === itemId)) return;
      newItem = { instanceId: `${Date.now()}`, type: 'dish', itemId };
    } else {
      const product = products.find((p) => p.id === itemId);
      if (!product) return;
      newItem = {
        instanceId: `${Date.now()}`,
        type: 'product',
        itemId,
        weight: product.portions?.[0]?.weight || 100,
      };
    }

    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    if (!newSelectedMeals[mealInstanceId]) newSelectedMeals[mealInstanceId] = [];
    newSelectedMeals[mealInstanceId].push(newItem);
    updateTrip(trip.id, { selectedMeals: newSelectedMeals });
  };

  const handleMealItemRemove = (mealInstanceId: string, instanceId: string) => {
    if (!trip) return;
    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals || {}));
    if (newSelectedMeals[mealInstanceId]) {
      newSelectedMeals[mealInstanceId] = newSelectedMeals[mealInstanceId].filter(
        (item: MealPlanItem) => item.instanceId !== instanceId
      );
      updateTrip(trip.id, { selectedMeals: newSelectedMeals });
    }
  };

  const handleUpdateMealTitle = (title: string, description: string) => {
    if (editingMeal && trip) {
      updateMealInstance(trip.id, editingMeal.day, editingMeal.meal.instanceId, {
        title,
        description,
      });
      setEditingMeal(null);
    }
  };

  const handleCloneSubmit = (newDishData: DishData, action: SubmitDishAction) => {
    const newDish = addDish(newDishData);
    if (!newDish || !trip || !cloningState) {
      setIsDishFormOpen(false);
      setCloningState(null);
      return;
    }

    const newSelectedMeals = JSON.parse(JSON.stringify(trip.selectedMeals));
    let mealId: string | undefined;

    // Find meal containing the item
    for (const dayKey in trip.dayMeals) {
      const dayMeals = trip.dayMeals[dayKey];
      for (const mi of dayMeals) {
        const items = newSelectedMeals[mi.instanceId] || [];
        if (items.some((item: MealPlanItem) => item.instanceId === cloningState.instanceId)) {
          mealId = mi.instanceId;
          break;
        }
      }
      if (mealId) break;
    }

    if (mealId) {
      if (action === 'replace') {
        const mealItems = newSelectedMeals[mealId] as MealPlanItem[];
        const itemIndex = mealItems.findIndex(
          (item) => item.instanceId === cloningState.instanceId
        );
        if (itemIndex !== -1) {
          mealItems[itemIndex] = { ...mealItems[itemIndex], itemId: newDish.id };
        }
      } else if (action === 'add_as_new') {
        const newItem: MealPlanItem = {
          instanceId: `${Date.now()}`,
          type: 'dish',
          itemId: newDish.id,
        };
        newSelectedMeals[mealId].push(newItem);
      }
      updateTrip(trip.id, { selectedMeals: newSelectedMeals });
    }

    setIsDishFormOpen(false);
    setCloningState(null);
  };

  const toggleDishExpansion = (instanceId: string) => {
    setExpandedDishes((prev) => ({ ...prev, [instanceId]: !prev[instanceId] }));
  };

  return {
    trip,
    products,
    dishes,
    sensors,

    // State
    isEditModalOpen,
    setIsEditModalOpen,
    isDishFormOpen,
    setIsDishFormOpen,
    editingMeal,
    setEditingMeal,
    cloningState,
    setCloningState,
    expandedDishes,
    openSections,
    activeDragId,
    setActiveDragId,

    // Options
    groupedMealOptions,
    mealTemplateOptions,

    // Actions
    updateTrip,
    removeMealFromDay,
    handleToggleSection,
    handleDragStart,
    handleDragEnd,
    handleAddTemplateToDay,
    handleMealItemAdd,
    handleMealItemRemove,
    handleUpdateMealTitle,
    handleCloneSubmit,
    toggleDishExpansion,
  };
};
