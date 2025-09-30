// src/pages/TripPlanningPage.tsx

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SingleValue } from 'react-select';
import ThemedSelect from '../ui/ThemedSelect';
import DropdownSelect from '../ui/DropdownSelect';
import DetailPane from '../ui/DetailPane';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import useCategoryStore from '../stores/useCategoryStore';
import useMealTypesStore from '../stores/useMealTypesStore';
import { formatDate } from '../utils';
import { calculateDayNutrition, calculateMealNutrition } from '../utils';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import TripForm from '../components/trips/TripForm';
import DishForm from '../components/dishes/DishForm';
import {
  Calendar,
  Utensils,
  Flame,
  Trash2,
  Plus,
  Edit,
  Scale,
  ArrowLeft,
  GripVertical,
  Info,
  ExternalLink,
  ChefHat,
  Component,
  MapPin,
} from 'lucide-react';
import type {
  Trip,
  TripData,
  Product,
  Dish,
  DishData,
  MealPlanItem,
  Category,
  SubmitDishAction,
} from '../types';

type SelectMealOption = { value: string; label: string };
type GroupedMealOption = { label: string; options: SelectMealOption[] };
type CloningState = {
  instanceId: string;
  dish: Dish;
  day: number;
  mealTypeId: number;
} | null;

const DishContents = ({ dish }: { dish: Dish }) => {
  const { products: allProducts } = useProductStore();
  const { categories } = useCategoryStore();

  return (
    <div className="pl-5 pt-2 space-y-1">
      {dish.products.map((p) => {
        const product = allProducts.find((ap) => ap.id === p.productId);
        const category = product
          ? categories.find((c: Category) => c.id === product.categoryId)
          : null;
        return (
          <div
            key={`${dish.id}-${p.productId}`}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span className="font-medium">
              {product?.name || '???'}: {p.weight}г
            </span>
            {category && (
              <span
                className="text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

type DragHandleProps = Record<string, unknown> & {
  'aria-describedby': string;
  role: string;
  tabIndex: number;
};

const SortableMealSlot: React.FC<{
  id: string;
  day: number;
  mealTypeId: number;
  mealName: string;
  trip: Trip;
  products: Product[];
  dishes: Dish[];
  groupedMealOptions: GroupedMealOption[];
  expandedDishes: Record<string, boolean>;
  onAddItem: (day: number, mealTypeId: number, option: SingleValue<SelectMealOption>) => void;
  onRemoveItem: (day: number, mealTypeId: number, instanceId: string) => void;
  onToggleDish: (instanceId: string) => void;
  onCloneRequest: (instanceId: string, dish: Dish, day: number, mealTypeId: number) => void;
  onRemoveMeal: (day: number, mealTypeId: number) => void;
}> = ({ id, ...props }) => {
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
    opacity: isDragging ? 0 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <MealSlot {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
};

const MealSlot: React.FC<{
  day: number;
  mealTypeId: number;
  mealName: string;
  trip: Trip;
  products: Product[];
  dishes: Dish[];
  groupedMealOptions: GroupedMealOption[];
  expandedDishes: Record<string, boolean>;
  onAddItem: (day: number, mealTypeId: number, option: SingleValue<SelectMealOption>) => void;
  onRemoveItem: (day: number, mealTypeId: number, instanceId: string) => void;
  onToggleDish: (instanceId: string) => void;
  onCloneRequest: (instanceId: string, dish: Dish, day: number, mealTypeId: number) => void;
  onRemoveMeal: (day: number, mealTypeId: number) => void;
  dragHandleProps?: DragHandleProps;
}> = ({
  day,
  mealTypeId,
  mealName,
  trip,
  products,
  dishes,
  groupedMealOptions,
  expandedDishes,
  onAddItem,
  onRemoveItem,
  onToggleDish,
  onCloneRequest,
  onRemoveMeal,
  dragHandleProps,
}) => {
  const mealId = `${day}-${mealTypeId}`;
  const selectedItems = (trip.selectedMeals?.[mealId] || []) as MealPlanItem[];
  const currentDishes = dishes;
  const mealNutrition = calculateMealNutrition(trip, day, mealTypeId, products, dishes);

  return (
    <div className="bg-card rounded-xl border notion-border-subtle p-4 space-y-3 hover:notion-shadow-sm transition-all duration-200">
      {/* Meal Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            {...dragHandleProps}
            className="cursor-move touch-none flex items-center gap-1 p-1 rounded hover:bg-muted/50 transition-colors notion-focus-ring"
            title="Перетащить прием пищи"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Utensils className="w-3.5 h-3.5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="font-medium text-foreground text-sm tracking-tight truncate">
              {mealName}
            </h5>
            {mealNutrition.productCount > 0 && (
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                <div className="flex items-center gap-1">
                  <Scale className="w-2.5 h-2.5" />
                  <span>{mealNutrition.weight}г</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" />
                  <span>{mealNutrition.calories}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Б:{mealNutrition.proteins}</span>
                  <span>Ж:{mealNutrition.fats}</span>
                  <span>У:{mealNutrition.carbs}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onRemoveMeal(day, mealTypeId)}
          className="text-muted-foreground hover:text-danger hover:bg-danger/10 flex-shrink-0"
          title="Удалить прием пищи"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Meal Items */}
      <div className="space-y-2">
        {selectedItems.map((item) => {
          let content = null;
          if (item.type === 'dish') {
            const dish = currentDishes.find((d) => d.id === item.itemId);
            if (dish) {
              const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);
              const isExpanded = expandedDishes[item.instanceId];
              content = (
                <div className="bg-muted/20 rounded-lg p-3 border border-muted">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => onToggleDish(item.instanceId)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-5 h-5 rounded border notion-border-subtle bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-3 h-3 text-primary" />
                      </div>
                      <span className="font-medium text-foreground text-sm truncate">
                        {dish.name} ({totalWeight}г)
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-0.5 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onCloneRequest(item.instanceId, dish, day, mealTypeId)}
                        className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                        title="Редактировать блюдо"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(day, mealTypeId, item.instanceId)}
                        className="p-1 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all duration-200"
                        title="Удалить блюдо"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {isExpanded && <DishContents dish={dish} />}
                </div>
              );
            } else {
              content = (
                <div className="bg-muted/20 rounded-lg p-3 border border-muted">
                  <div className="italic text-muted-foreground text-sm">Блюдо не найдено</div>
                </div>
              );
            }
          } else {
            const product = products.find((p) => p.id === item.itemId);
            content = (
              <div className="bg-muted/20 rounded-lg p-3 border border-muted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 rounded border notion-border-subtle bg-muted/50 flex items-center justify-center flex-shrink-0">
                      <Component className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground text-sm truncate">
                      {product?.name || 'Продукт не найден'} ({item.weight}г)
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveItem(day, mealTypeId, item.instanceId)}
                    className="p-1 rounded text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all duration-200 flex-shrink-0"
                    title="Удалить продукт"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          }
          return <div key={item.instanceId}>{content}</div>;
        })}
      </div>

      {/* Add Item Selector */}
      <div className="space-y-3">
        <ThemedSelect<SelectMealOption, false, GroupedMealOption>
          options={groupedMealOptions}
          onChange={(option) => {
            if (option) {
              onAddItem(day, mealTypeId, option);
            }
          }}
          placeholder={
            groupedMealOptions.length === 0
              ? 'Сначала создайте продукты или блюда'
              : 'Добавить продукт или блюдо...'
          }
          value={null}
          isDisabled={groupedMealOptions.length === 0}
          isClearable={false}
          formatGroupLabel={(data) => (
            <div className="flex items-center justify-between py-1">
              <span className="font-medium text-foreground text-sm">{data.label}</span>
              <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                {data.options.length}
              </span>
            </div>
          )}
          noOptionsMessage={() => 'Нет доступных опций'}
        />

        {groupedMealOptions.length === 0 && (
          <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-warning text-sm">Нет доступных продуктов или блюд</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Создайте продукты и блюда в соответствующих разделах
                </p>
                <div className="flex gap-2">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded text-xs font-medium hover:bg-warning/20 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Продукты
                  </a>
                  <a
                    href="/dishes"
                    className="inline-flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded text-xs font-medium hover:bg-warning/20 transition-colors"
                  >
                    <ChefHat className="w-3 h-3" />
                    Блюда
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function TripPlanningPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const numericTripId = tripId ? parseInt(tripId, 10) : undefined;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDishFormOpen, setIsDishFormOpen] = useState(false);
  const [cloningState, setCloningState] = useState<CloningState>(null);
  const [expandedDishes, setExpandedDishes] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<string[]>(['day-1']);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const trip = useTripStore((state) => state.trips.find((t) => t.id === numericTripId));

  const { updateTrip, addMealToDay, removeMealFromDay, reorderMealsInDay } = useTripStore();
  const { products } = useProductStore();
  const { dishes, addDish } = useDishStore();
  const { mealTypes } = useMealTypesStore();

  const migratedTrip = useMemo(() => {
    if (trip && !trip.dayMeals) {
      const dayMeals: { [dayNumber: string]: number[] } = {};
      for (let day = 1; day <= trip.days; day++) {
        const mealCount = trip.mealsPerDay || 3;
        if (mealCount === 3) {
          dayMeals[day.toString()] = [1, 2, 3];
        } else if (mealCount === 4) {
          dayMeals[day.toString()] = [1, 2, 3, 4];
        } else if (mealCount === 5) {
          dayMeals[day.toString()] = [1, 2, 3, 4, 5];
        } else {
          dayMeals[day.toString()] = [1, 2, 3];
        }
      }
      const newTrip = { ...trip, dayMeals };
      updateTrip(trip.id, { dayMeals });
      return newTrip;
    }
    return trip;
  }, [trip, updateTrip]);

  const getMealNameById = (mealTypeId: number): string => {
    const mealType = mealTypes.find((mt) => mt.id === mealTypeId);
    return mealType?.name || `Прием пищи ${mealTypeId}`;
  };

  const generateMealId = (day: number, mealTypeId: number): string => {
    return `${day}-${mealTypeId}`;
  };

  const calculateDayNutritionLocal = (day: number) => {
    return calculateDayNutrition(migratedTrip, day, products, dishes);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent, day: number) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!trip || !over || active.id === over.id) {
      return;
    }

    const oldIndex = (trip.dayMeals[day] || []).findIndex(
      (id) => generateMealId(day, id) === active.id
    );
    const newIndex = (trip.dayMeals[day] || []).findIndex(
      (id) => generateMealId(day, id) === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderMealsInDay(trip.id, day, oldIndex, newIndex);
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const groupedMealOptions: GroupedMealOption[] = useMemo(() => {
    const productOptions: SelectMealOption[] = products.map((p: Product) => ({
      value: `product-${p.id}`,
      label: p.name,
    }));
    const dishOptions: SelectMealOption[] = dishes.map((d: Dish) => ({
      value: `dish-${d.id}`,
      label: d.name,
    }));

    const options = [];
    if (dishOptions.length > 0) options.push({ label: 'Блюда', options: dishOptions });
    if (productOptions.length > 0) options.push({ label: 'Продукты', options: productOptions });

    return options;
  }, [products, dishes]);

  const handleMealItemAdd = (
    day: number,
    mealTypeId: number,
    selectedOption: SingleValue<SelectMealOption>
  ) => {
    if (!migratedTrip || !selectedOption || typeof selectedOption.value !== 'string') {
      return;
    }
    const [type, idStr] = selectedOption.value.split('-');
    if (!type || !idStr) return;

    const itemId = parseInt(idStr, 10);
    if (isNaN(itemId)) return;

    const mealId = generateMealId(day, mealTypeId);
    let newItem: MealPlanItem;

    if (type === 'dish') {
      const dish = dishes.find((d) => d.id === itemId);
      if (!dish) return;
      newItem = { instanceId: `${Date.now()}`, type: 'dish', itemId };
    } else if (type === 'product') {
      const product = products.find((p) => p.id === itemId);
      if (!product) return;
      let weight = 100;
      if (product.portions && product.portions.length > 0) {
        weight = product.portions[0].weight || 100;
      }
      newItem = { instanceId: `${Date.now()}`, type: 'product', itemId, weight };
    } else {
      return;
    }

    const newSelectedMeals = JSON.parse(JSON.stringify(migratedTrip.selectedMeals || {}));
    if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];
    newSelectedMeals[mealId].push(newItem);
    updateTrip(migratedTrip.id, { selectedMeals: newSelectedMeals });
  };

  const handleMealItemRemove = (day: number, mealTypeId: number, instanceId: string) => {
    if (!migratedTrip) return;
    const mealId = generateMealId(day, mealTypeId);
    const newSelectedMeals = JSON.parse(JSON.stringify(migratedTrip.selectedMeals || {}));
    if (newSelectedMeals[mealId]) {
      newSelectedMeals[mealId] = newSelectedMeals[mealId].filter(
        (item: MealPlanItem) => item.instanceId !== instanceId
      );
      updateTrip(migratedTrip.id, { selectedMeals: newSelectedMeals });
    }
  };

  const handleRemoveMeal = (day: number, mealTypeId: number) => {
    if (migratedTrip) {
      removeMealFromDay(migratedTrip.id, day, mealTypeId);
    }
  };

  const handleCloneRequest = (instanceId: string, dish: Dish, day: number, mealTypeId: number) => {
    setCloningState({ instanceId, dish, day, mealTypeId });
  };

  const handleCloneConfirm = () => {
    if (cloningState) setIsDishFormOpen(true);
  };

  const handleCloneSubmit = (newDishData: DishData, action: SubmitDishAction) => {
    const newDish = addDish(newDishData);
    if (!newDish || !migratedTrip || !cloningState) {
      setIsDishFormOpen(false);
      setCloningState(null);
      return;
    }

    const newSelectedMeals = JSON.parse(JSON.stringify(migratedTrip.selectedMeals));
    const mealId = generateMealId(cloningState.day, cloningState.mealTypeId);

    if (action === 'replace') {
      if (newSelectedMeals[mealId]) {
        const mealItems = newSelectedMeals[mealId] as MealPlanItem[];
        const itemIndex = mealItems.findIndex(
          (item) => item.instanceId === cloningState.instanceId
        );
        if (itemIndex !== -1) {
          mealItems[itemIndex] = { ...mealItems[itemIndex], itemId: newDish.id };
          updateTrip(migratedTrip.id, { selectedMeals: newSelectedMeals });
        }
      }
    } else if (action === 'add_as_new') {
      const newItem: MealPlanItem = {
        instanceId: `${Date.now()}`,
        type: 'dish',
        itemId: newDish.id,
      };
      if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];
      newSelectedMeals[mealId].push(newItem);
      updateTrip(migratedTrip.id, { selectedMeals: newSelectedMeals });
    }

    setIsDishFormOpen(false);
    setCloningState(null);
  };

  const toggleDishExpansion = (instanceId: string) => {
    setExpandedDishes((prev) => ({ ...prev, [instanceId]: !prev[instanceId] }));
  };

  useEffect(() => {
    setOpenSections(['day-1']);
  }, []);

  const handleDetailsUpdate = (formData: TripData) => {
    if (!migratedTrip) return;
    updateTrip(migratedTrip.id, formData);
    setIsEditModalOpen(false);
  };

  if (!migratedTrip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
            Поход не найден
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Возможно, он был удален или вы перешли по неверной ссылке.
          </p>
          <Button onClick={() => navigate('/trips')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к походам
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4 pb-6 border-b notion-border-subtle">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                {migratedTrip.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatDate(migratedTrip.startDate)} — {formatDate(migratedTrip.endDate)}
              </p>
              {migratedTrip.description && (
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mt-1">
                  {migratedTrip.description}
                </p>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/trips')}>
                <ArrowLeft className="w-4 h-4 mr-2" />К списку
              </Button>
            </div>
          </div>
        </div>

        {/* Meal Planning Section */}
        <DetailPane
          openSections={openSections}
          onToggleSection={handleToggleSection}
          sections={Array.from({ length: migratedTrip.days }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const dayNutrition = calculateDayNutritionLocal(day);
            const dayMeals = migratedTrip.dayMeals?.[day.toString()] || [];

            return {
              id: `day-${day}`,
              title: (
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold">День {day}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2" title="Общий вес / На человека">
                      <Scale className="w-3.5 h-3.5" />
                      <span className="font-medium">
                        {dayNutrition.totalWeightForAllUsers}г / {dayNutrition.weightPerUser}г
                      </span>
                    </div>
                    <div className="flex items-center gap-2" title="Калорийность на человека">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-medium">{dayNutrition.calories} ккал</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span>Б:{dayNutrition.proteins}</span>
                      <span>Ж:{dayNutrition.fats}</span>
                      <span>У:{dayNutrition.carbs}</span>
                    </div>
                  </div>
                </div>
              ),
              icon: Calendar,
              actionButton: (
                <DropdownSelect
                  label=""
                  icon={Plus}
                  options={[
                    { value: '', label: 'Выберите прием пищи' },
                    ...mealTypes
                      .filter((mt) => mt.repeatable || !dayMeals.includes(mt.id))
                      .map((mt) => ({ value: mt.id.toString(), label: mt.name })),
                  ]}
                  value=""
                  onChange={(value) => {
                    if (value && value !== '' && migratedTrip) {
                      addMealToDay(migratedTrip.id, day, parseInt(value, 10));
                    }
                  }}
                  placeholder="Добавить прием пищи"
                />
              ),
              content: (
                <div className="space-y-4">
                  {dayMeals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h4 className="font-medium text-foreground mb-2">Нет приемов пищи</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Добавьте приемы пищи для планирования рациона на этот день
                      </p>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={(e) => handleDragEnd(e, day)}
                      onDragCancel={handleDragCancel}
                    >
                      <SortableContext
                        items={dayMeals.map((mealTypeId) => generateMealId(day, mealTypeId))}
                        strategy={verticalListSortingStrategy}
                      >
                        {dayMeals.map((mealTypeId) => (
                          <SortableMealSlot
                            key={generateMealId(day, mealTypeId)}
                            id={generateMealId(day, mealTypeId)}
                            day={day}
                            mealTypeId={mealTypeId}
                            mealName={getMealNameById(mealTypeId)}
                            trip={migratedTrip}
                            products={products}
                            dishes={dishes}
                            groupedMealOptions={groupedMealOptions}
                            expandedDishes={expandedDishes}
                            onAddItem={handleMealItemAdd}
                            onRemoveItem={handleMealItemRemove}
                            onToggleDish={toggleDishExpansion}
                            onCloneRequest={handleCloneRequest}
                            onRemoveMeal={handleRemoveMeal}
                          />
                        ))}
                      </SortableContext>
                      <DragOverlay>
                        {activeDragId && migratedTrip ? (
                          <MealSlot
                            day={Number(activeDragId.split('-')[0])}
                            mealTypeId={Number(activeDragId.split('-')[1])}
                            mealName={getMealNameById(Number(activeDragId.split('-')[1]))}
                            trip={migratedTrip}
                            products={products}
                            dishes={dishes}
                            groupedMealOptions={groupedMealOptions}
                            expandedDishes={expandedDishes}
                            onAddItem={handleMealItemAdd}
                            onRemoveItem={handleMealItemRemove}
                            onToggleDish={toggleDishExpansion}
                            onCloneRequest={handleCloneRequest}
                            onRemoveMeal={handleRemoveMeal}
                          />
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </div>
              ),
            };
          })}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b notion-border-subtle">
              <div className="w-8 h-8 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">
                  План питания
                </h3>
                <p className="text-sm text-muted-foreground">
                  Планирование рациона по дням и приемам пищи
                </p>
              </div>
            </div>
          </div>
        </DetailPane>
      </div>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать поход"
        size="xl"
      >
        <TripForm
          trip={migratedTrip}
          onSubmit={handleDetailsUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Clone Confirmation Modal */}
      <ConfirmModal
        isOpen={!!cloningState}
        onClose={() => setCloningState(null)}
        onConfirm={handleCloneConfirm}
        title={`Редактировать "${cloningState?.dish.name}"?`}
        confirmText="Создать и редактировать копию"
        cancelText="Отмена"
        variant="secondary"
      >
        <div className="space-y-3">
          <p className="leading-relaxed">
            Чтобы изменить состав этого блюда, будет создана его редактируемая копия. Исходный
            шаблон останется без изменений.
          </p>
          <div className="p-3 bg-muted/30 rounded-lg border notion-border-subtle">
            <p className="text-sm text-muted-foreground">
              Вы сможете выбрать, заменить ли блюдо в раскладке или добавить как новое.
            </p>
          </div>
        </div>
      </ConfirmModal>

      {/* Dish Form Modal */}
      <Modal
        isOpen={isDishFormOpen}
        onClose={() => {
          setIsDishFormOpen(false);
          setCloningState(null);
        }}
        title="Редактирование копии блюда"
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
}

export default TripPlanningPage;
