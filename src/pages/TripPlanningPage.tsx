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
  Zap,
  Droplet,
  Wheat,
  Trash2,
  Plus,
  Edit,
  Scale,
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
    <ul className="text-xs text-muted-foreground pl-5 mt-1 space-y-0.5">
      {dish.products.map((p) => {
        const product = allProducts.find((ap) => ap.id === p.productId);
        const category = product
          ? categories.find((c: Category) => c.id === product.categoryId)
          : null;
        return (
          <li key={`${dish.id}-${p.productId}`} className="flex items-center gap-2">
            <span>
              {product?.name || '???'}: {p.weight} г
            </span>
            {category && (
              <span
                className="text-white text-[10px] px-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// Типизация для dragHandleProps
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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <div className="border rounded-lg p-3 space-y-3 bg-gray-50 dark:bg-gray-700/50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              {...dragHandleProps}
              className="cursor-move touch-none flex items-center gap-2"
              title="Перетащить прием пищи"
            >
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm2 2a1 1 0 100 2h4a1 1 0 100-2H8zm0 4a1 1 0 100 2h4a1 1 0 100-2H8z" />
              </svg>
              <Utensils className="w-4 h-4 text-primary" />
              <h5 className="font-semibold text-gray-900 dark:text-white">{mealName}</h5>
            </div>
          </div>
          {mealNutrition.productCount > 0 && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
              <div className="flex items-center gap-1" title="Общий вес">
                <Scale className="w-3 h-3" />
                <span>{mealNutrition.weight}г</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1" title="Калорийность">
                <Flame className="w-3 h-3" />
                <span>{mealNutrition.calories}</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1" title="Белки">
                <Zap className="w-3 h-3" />
                <span>Б:{mealNutrition.proteins}</span>
              </div>
              <div className="flex items-center gap-1" title="Жиры">
                <Droplet className="w-3 h-3" />
                <span>Ж:{mealNutrition.fats}</span>
              </div>
              <div className="flex items-center gap-1" title="Углеводы">
                <Wheat className="w-3 h-3" />
                <span>У:{mealNutrition.carbs}</span>
              </div>
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemoveMeal(day, mealTypeId)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-8"
          title="Удалить прием пищи"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {selectedItems.map((item) => {
          let content = null;
          if (item.type === 'dish') {
            const dish = currentDishes.find((d) => d.id === item.itemId);
            if (dish) {
              const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);
              const isExpanded = expandedDishes[item.instanceId];
              content = (
                <div>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => onToggleDish(item.instanceId)}
                  >
                    <span>
                      ⭐ {dish.name} ({totalWeight} г)
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onCloneRequest(item.instanceId, dish, day, mealTypeId)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Редактировать блюдо"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(day, mealTypeId, item.instanceId)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
              content = <div className="italic text-muted-foreground">Блюдо не найдено</div>;
            }
          } else {
            const product = products.find((p) => p.id === item.itemId);
            content = (
              <div className="flex items-center justify-between">
                <span>
                  {product?.name || 'Продукт не найден'} ({item.weight} г)
                </span>
                <button
                  onClick={() => onRemoveItem(day, mealTypeId, item.instanceId)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Удалить продукт"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          }
          return (
            <div
              key={item.instanceId}
              className="text-sm p-2 bg-card-foreground/5 dark:bg-card-foreground/10 rounded"
            >
              {content}
            </div>
          );
        })}
      </div>

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
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{data.label}</span>
            <span className="text-xs bg-muted text-muted-foreground rounded-full px-1.5">
              {data.options.length}
            </span>
          </div>
        )}
        noOptionsMessage={() => 'Нет доступных опций'}
      />

      {groupedMealOptions.length === 0 && (
        <div className="text-xs text-muted-foreground mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Нет доступных продуктов или блюд
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                Чтобы добавлять продукты в приемы пищи, сначала создайте их в соответствующих
                разделах:
              </p>
              <div className="flex gap-2">
                <a
                  href="/products"
                  className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors text-xs font-medium"
                >
                  📦 Создать продукты
                </a>
                <a
                  href="/dishes"
                  className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors text-xs font-medium"
                >
                  🍽️ Создать блюда
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
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
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, day: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id && migratedTrip) {
      const dayKey = day.toString();
      const dayMeals = [...(migratedTrip.dayMeals?.[dayKey] || [])];
      const oldIndex = dayMeals.findIndex((_, index) => `meal-${day}-${index}` === active.id);
      const newIndex = dayMeals.findIndex((_, index) => `meal-${day}-${index}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderMealsInDay(migratedTrip.id, day, oldIndex, newIndex);
      }
    }
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
      label: `⭐ ${d.name}`,
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
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">Поход не найден</h2>
        <p className="text-muted-foreground my-4">
          Возможно, он был удален или вы перешли по неверной ссылке.
        </p>
        <Button onClick={() => navigate('/trips')} className="mt-4">
          Назад к походам
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-primary">{migratedTrip.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formatDate(migratedTrip.startDate)} - {formatDate(migratedTrip.endDate)}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>
              Редактировать
            </Button>
            <Button variant="ghost" onClick={() => navigate('/trips')}>
              ← К списку походов
            </Button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">План питания</h3>
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
                    <span>День {day}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div
                        className="flex items-center gap-1"
                        title="Общий вес (все участники) / На человека"
                      >
                        <Scale className="w-3 h-3" />
                        <span>
                          {dayNutrition.totalWeightForAllUsers}г / {dayNutrition.weightPerUser}г
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1" title="Калорийность на человека">
                        <Flame className="w-3 h-3" />
                        <span>{dayNutrition.calories} ккал</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1" title="БЖУ на человека">
                        <div className="flex items-center gap-0.5">
                          <Zap className="w-3 h-3" />
                          <span>Б:{dayNutrition.proteins}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Droplet className="w-3 h-3" />
                          <span>Ж:{dayNutrition.fats}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Wheat className="w-3 h-3" />
                          <span>У:{dayNutrition.carbs}</span>
                        </div>
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
                  <div className="space-y-3">
                    {dayMeals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Utensils className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Добавьте приемы пищи для этого дня</p>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, day)}
                      >
                        <SortableContext
                          items={dayMeals.map((_, index) => `meal-${day}-${index}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {dayMeals.map((mealTypeId, index) => (
                            <SortableMealSlot
                              key={`meal-${day}-${index}`}
                              id={`meal-${day}-${index}`}
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
                              onRemoveMeal={(d, mId) => {
                                if (migratedTrip) removeMealFromDay(migratedTrip.id, d, mId);
                              }}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                ),
              };
            })}
          >
            <div></div>
          </DetailPane>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать поход"
      >
        <TripForm
          trip={migratedTrip}
          onSubmit={handleDetailsUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!cloningState}
        onClose={() => setCloningState(null)}
        onConfirm={handleCloneConfirm}
        title={`Редактировать "${cloningState?.dish.name}"?`}
        confirmText="Создать и редактировать копию"
      >
        <p>
          Чтобы изменить состав этого блюда, будет создана его редактируемая копия. Исходный шаблон
          останется без изменений.
        </p>
      </ConfirmModal>

      <Modal
        isOpen={isDishFormOpen}
        onClose={() => {
          setIsDishFormOpen(false);
          setCloningState(null);
        }}
        title={`Редактирование копии блюда`}
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
    </>
  );
}

export default TripPlanningPage;
