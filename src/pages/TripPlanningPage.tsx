// src/pages/TripPlanningPage.tsx

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SingleValue } from 'react-select';
import { DndContext, closestCenter, DragOverlay, DragEndEvent } from '@dnd-kit/core';
import { verticalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Hooks & Utils
import { useTripPlanning } from '../hooks/useTripPlanning';
import { calculateDayNutrition, calculateMealNutrition, formatDate } from '../utils';
import useCategoryStore from '../stores/useCategoryStore'; // Исправленный импорт

// Components & UI
import DropdownSelect from '../ui/DropdownSelect';
import DetailPane from '../ui/DetailPane';
import TripForm from '../components/trips/TripForm';
import DishForm from '../components/dishes/DishForm';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import MealItemCard from '../components/planning/MealItemCard';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';

// Icons
import {
  Utensils,
  Flame,
  Trash2,
  Plus,
  Scale,
  ArrowLeft,
  GripVertical,
  MapPin,
  Pencil,
  CalendarDays,
  Edit,
} from 'lucide-react';

// Types
import type { Trip, Product, Dish, MealPlanItem, Category, MealInstance } from '../types';

// --- Type Definitions ---

type SelectMealOption = { value: string; label: string };
type GroupedMealOption = { label: string; options: SelectMealOption[] };

interface TripPlanningHandlers {
  setEditingMeal: (data: { day: number; meal: MealInstance }) => void;
  removeMealFromDay: (tripId: number, day: number, instanceId: string) => void;
  handleMealItemRemove: (mealInstanceId: string, itemInstanceId: string) => void;
  handleMealItemAdd: (
    day: number,
    mealInstanceId: string,
    option: SingleValue<SelectMealOption>
  ) => void;
  setCloningState: (state: { instanceId: string; dish: Dish; day: number }) => void;
  toggleDishExpansion: (instanceId: string) => void;
}

// --- Helpers & Subcomponents ---

const DishContents = React.memo(
  ({ dish, products, categories }: { dish: Dish; products: Product[]; categories: Category[] }) => {
    return (
      <div className="space-y-1.5 text-xs">
        {dish.products.map((p: { productId: number; weight: number }, idx: number) => {
          const product = products.find((ap) => ap.id === p.productId);
          const category = product ? categories.find((c) => c.id === product.categoryId) : null;
          return (
            <div
              key={`${dish.id}-${p.productId}-${idx}`}
              className="flex items-center justify-between text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                <span>{product?.name || 'Неизвестный продукт'}</span>
              </div>
              <div className="flex items-center gap-2">
                {category && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium opacity-80 text-white bg-gray-500">
                    {category.name}
                  </span>
                )}
                <span className="font-mono">{p.weight}г</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

DishContents.displayName = 'DishContents';

interface MealSlotProps {
  day: number;
  meal: MealInstance;
  trip: Trip;
  products: Product[];
  dishes: Dish[];
  categories: Category[];
  groupedMealOptions: GroupedMealOption[];
  expandedDishes: Record<string, boolean>;
  handlers: TripPlanningHandlers;
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const MealSlotBase: React.FC<MealSlotProps> = ({
  day,
  meal,
  trip,
  products,
  dishes,
  categories,
  groupedMealOptions,
  expandedDishes,
  handlers,
  dragHandleProps,
}) => {
  const selectedItems = (trip.selectedMeals?.[meal.instanceId] || []) as MealPlanItem[];

  const mealNutrition = useMemo(
    () => calculateMealNutrition(trip, meal.instanceId, products, dishes),
    [trip, meal.instanceId, products, dishes]
  );

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing touch-none flex items-center gap-1 p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
            title="Перетащить"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Utensils className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h5 className="font-semibold text-foreground text-sm truncate">{meal.title}</h5>
            {meal.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{meal.description}</p>
            )}
            {mealNutrition.productCount > 0 && (
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <Scale className="w-3 h-3" />
                  <span className="font-medium text-foreground">{mealNutrition.weight} г</span>
                </div>
                <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="font-medium text-foreground">{mealNutrition.calories}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => handlers.setEditingMeal({ day, meal })}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => handlers.removeMealFromDay(trip.id, day, meal.instanceId)}
            className="text-muted-foreground hover:text-danger hover:bg-danger/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {selectedItems.map((item) => {
          const isDish = item.type === 'dish';
          const itemData = isDish
            ? dishes.find((d) => d.id === item.itemId)
            : products.find((p) => p.id === item.itemId);
          return (
            <MealItemCard
              key={item.instanceId}
              type={item.type as 'product' | 'dish'}
              itemData={itemData}
              weight={item.type === 'product' ? item.weight : undefined}
              onRemove={() => handlers.handleMealItemRemove(meal.instanceId, item.instanceId)}
              onEdit={
                isDish
                  ? () =>
                      handlers.setCloningState({
                        instanceId: item.instanceId,
                        dish: itemData as Dish,
                        day,
                      })
                  : undefined
              }
              onToggleExpand={
                isDish ? () => handlers.toggleDishExpansion(item.instanceId) : undefined
              }
              isExpanded={isDish ? expandedDishes[item.instanceId] : false}
            >
              {isDish && itemData && (
                <DishContents dish={itemData as Dish} products={products} categories={categories} />
              )}
            </MealItemCard>
          );
        })}
        {selectedItems.length === 0 && (
          <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
            <span className="text-xs text-muted-foreground">Список пуст</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      <DropdownSelect
        label=""
        icon={Plus}
        options={groupedMealOptions.flatMap((g) => g.options)}
        value=""
        onChange={(val) => {
          if (typeof val === 'string' && val) {
            const option = groupedMealOptions
              .flatMap((g) => g.options)
              .find((o) => o.value === val);
            if (option) handlers.handleMealItemAdd(day, meal.instanceId, option);
          }
        }}
        placeholder="Добавить..."
        containerClassName="w-full"
        searchable
      />
    </div>
  );
};

const MealSlot = React.memo(MealSlotBase, (prev, next) => {
  const prevItems = prev.trip.selectedMeals?.[prev.meal.instanceId];
  const nextItems = next.trip.selectedMeals?.[next.meal.instanceId];

  return (
    prev.meal.title === next.meal.title &&
    prev.meal.description === next.meal.description &&
    prev.expandedDishes === next.expandedDishes &&
    JSON.stringify(prevItems) === JSON.stringify(nextItems)
  );
});

MealSlot.displayName = 'MealSlot';

interface SortableMealSlotProps extends MealSlotProps {
  id: string;
}

const SortableMealSlot = ({ id, ...props }: SortableMealSlotProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none" data-testid="sortable-meal-slot">
      <MealSlot {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

// --- Main Page Component ---

const TripPlanningPage: React.FC = () => {
  const navigate = useNavigate();

  // Import logic from Hook
  const {
    trip,
    products,
    dishes,
    sensors,
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
    groupedMealOptions,
    mealTemplateOptions,
    updateTrip,
    handleToggleSection,
    handleDragStart,
    handleDragEnd,
    handleAddTemplateToDay,
    handleMealItemAdd,
    handleMealItemRemove,
    handleUpdateMealTitle,
    handleCloneSubmit,
    toggleDishExpansion,
    removeMealFromDay,
  } = useTripPlanning();

  const { categories } = useCategoryStore();

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">Поход не найден</h2>
          <Button onClick={() => navigate('/trips')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
        </div>
      </div>
    );
  }

  const handlers: TripPlanningHandlers = {
    handleMealItemAdd,
    handleMealItemRemove,
    setCloningState,
    toggleDishExpansion,
    setEditingMeal,
    removeMealFromDay,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 pb-6 border-b border-border">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{trip.name}</h1>
              <p className="text-sm text-muted-foreground">
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </p>
              {trip.description && (
                <p className="text-sm text-muted-foreground max-w-2xl mt-2">{trip.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Изменить
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/trips')}>
                <ArrowLeft className="w-4 h-4 mr-2" />К списку
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <DetailPane
          openSections={openSections}
          onToggleSection={handleToggleSection}
          sections={Array.from({ length: trip.days }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dayNutrition = calculateDayNutrition(trip, day, products, dishes);
            const dayMeals = trip.dayMeals?.[day.toString()] || [];

            return {
              id: `day-${day}`,
              title: (
                <div className="flex items-baseline gap-3">
                  <span className="font-semibold">День {day}</span>
                  <span className="text-xs font-normal text-muted-foreground flex gap-2">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {dayNutrition.calories}
                    </span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3 h-3" /> {dayNutrition.totalWeightForAllUsers} г
                    </span>
                  </span>
                </div>
              ),
              icon: CalendarDays,
              content: (
                <div className="space-y-6">
                  <DropdownSelect
                    label=""
                    icon={Plus}
                    options={mealTemplateOptions}
                    value=""
                    onChange={(val) =>
                      typeof val === 'string' && val && handleAddTemplateToDay(day, val)
                    }
                    placeholder="Добавить приём пищи (из шаблона)"
                    containerClassName="max-w-md"
                  />
                  {dayMeals.length === 0 ? (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-muted rounded-lg bg-muted/5">
                      <p className="text-sm text-muted-foreground">
                        На этот день ничего не запланировано.
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={(e: DragEndEvent) => handleDragEnd(e, day)}
                      onDragCancel={() => setActiveDragId(null)}
                    >
                      <SortableContext
                        items={dayMeals.map((m) => m.instanceId)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="grid gap-4">
                          {dayMeals.map((meal) => (
                            <SortableMealSlot
                              key={meal.instanceId}
                              id={meal.instanceId}
                              day={day}
                              meal={meal}
                              trip={trip}
                              products={products}
                              dishes={dishes}
                              categories={categories}
                              groupedMealOptions={groupedMealOptions}
                              expandedDishes={expandedDishes}
                              handlers={handlers}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay>
                        {activeDragId &&
                          (() => {
                            const activeMeal = Object.values(trip.dayMeals)
                              .flat()
                              .find((m) => m.instanceId === activeDragId);
                            if (!activeMeal) return null;
                            return (
                              <MealSlot
                                day={day}
                                meal={activeMeal}
                                trip={trip}
                                products={products}
                                dishes={dishes}
                                categories={categories}
                                groupedMealOptions={groupedMealOptions}
                                expandedDishes={expandedDishes}
                                handlers={handlers}
                              />
                            );
                          })()}
                      </DragOverlay>
                    </DndContext>
                  )}
                </div>
              ),
            };
          })}
        >
          <></>
        </DetailPane>
      </div>

      {/* --- Modals --- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать поход"
        size="xl"
      >
        <TripForm
          trip={trip}
          onSubmit={(data) => {
            updateTrip(trip.id, data);
            setIsEditModalOpen(false);
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        title="Редактировать приём пищи"
        size="md"
      >
        {editingMeal && (
          <EditMealForm
            title={editingMeal.meal.title}
            description={editingMeal.meal.description || ''}
            onSubmit={handleUpdateMealTitle}
            onCancel={() => setEditingMeal(null)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!cloningState}
        onClose={() => setCloningState(null)}
        onConfirm={() => setIsDishFormOpen(true)}
        title={`Редактировать "${cloningState?.dish.name}"?`}
        confirmText="Создать копию"
        cancelText="Отмена"
        variant="primary"
      >
        <p>Будет создана локальная копия блюда для редактирования.</p>
      </ConfirmModal>

      <Modal
        isOpen={isDishFormOpen}
        onClose={() => {
          setIsDishFormOpen(false);
          setCloningState(null);
        }}
        title="Редактирование блюда"
        size="xl"
      >
        <DishForm
          dish={null}
          dishToClone={cloningState?.dish || null}
          onSubmit={handleCloneSubmit}
          onCancel={() => {
            setIsDishFormOpen(false);
            setCloningState(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Simple sub-component for editing meal title/desc
const EditMealForm: React.FC<{
  title: string;
  description: string;
  onSubmit: (t: string, d: string) => void;
  onCancel: () => void;
}> = ({ title: initialTitle, description: initialDesc, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDesc);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(title, description);
      }}
      className="space-y-4"
    >
      <Input
        label="Название"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />
      <Textarea
        label="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  );
};

export default TripPlanningPage;
