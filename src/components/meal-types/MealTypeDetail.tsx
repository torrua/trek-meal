// src/components/meal-types/MealTypeDetail.tsx

import React, { useState } from 'react';
import {
  Info,
  Edit,
  Save,
  Utensils,
  Hash,
  ChevronDown,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  SquareArrowOutUpRight,
  Trash2,
  Tag,
} from 'lucide-react';
import type { MealType, Meal } from '../../types';
import Button from '../../ui/Button';
import MealTypeForm from './MealTypeForm';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import useMealTypesStore from '../../stores/useMealTypesStore';
import useMealStore from '../../stores/useMealStore';
import useDishStore from '../../stores/useDishStore';
import useProductStore from '../../stores/useProductStore';
import { toast } from 'react-hot-toast';
import { calculateNutrition } from '../meals/mealFormUtils';
import { useNavigate } from 'react-router-dom';

interface MealTypeDetailProps {
  mealType: MealType | null;
  onEdit?: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  gradientCssVar?: string; // Add this new prop
  className?: string;
  disableToggle?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id: _id,
  title,
  icon,
  children,
  isOpen,
  onToggle: _onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
  gradientCssVar, // Add this new prop
  className,
  disableToggle = false,
}) => {
  // Удалена unused переменная после замены на shadow-md

  // Use CSS variable gradient if provided, otherwise use Tailwind classes
  const gradientClass = gradientCssVar
    ? `[background:${gradientCssVar}]`
    : `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`;

  return (
    <div className={`${className || ''} collapsible-section`}>
      <div className={`${gradientClass} collapsible-section-gradient`}></div>
      <div className="relative">
        <div
          className="flex items-center justify-between gap-3 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            // Don't toggle section when disableToggle is true
            if (!disableToggle) {
              _onToggle(_id);
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              {icon}
            </div>
            <h2 className="text-lg font-semibold truncate">{title}</h2>
            {summaryContent && <div className="ml-2 flex-shrink-0">{summaryContent}</div>}
          </div>
          <div className="flex items-center gap-2 min-w-[200px] justify-end">
            {actionButton}
            {headerContent}
          </div>
        </div>
        {isOpen && <div className="p-6 pt-0 pb-8">{children}</div>}
      </div>
    </div>
  );
};

const MealTypeDetail: React.FC<MealTypeDetailProps> = ({
  mealType,
  onEdit: _onEdit,
  editTrigger = 0,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger = 0,
  editCancelTrigger = 0,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Set<number>>(new Set());
  const [deletedMeals, setDeletedMeals] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const { updateMealType, addMealType } = useMealTypesStore();

  React.useEffect(() => {
    if (editTrigger > 0) {
      setIsEditing(true);
      setIsInlineEditing(true);
      setEditName('');
      setEditDescription('');
      onStartEdit?.();
    }
  }, [editTrigger, onStartEdit]); // isEditing не нужен - это состояние которое мы устанавливаем

  React.useEffect(() => {
    if (editSubmitTrigger > 0) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  }, [editSubmitTrigger, onFinishEdit]);

  React.useEffect(() => {
    if (editCancelTrigger > 0) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  }, [editCancelTrigger, onFinishEdit]);

  const handleInlineEdit = () => {
    if (mealType) {
      // Ensure the basic-info section is open when entering edit mode
      if (!openSections.includes('basic-info')) {
        onToggleSection('basic-info');
      }
      setEditName(mealType.name);
      setEditDescription(mealType.description || '');
      setIsInlineEditing(true);
    }
  };

  const handleInlineSave = async () => {
    try {
      setIsSubmitting(true);

      if (mealType) {
        // Редактирование существующего типа
        await updateMealType(mealType.id, editName);
        toast.success('Тип приёма пищи обновлён');

        // Remove meal type associations from deleted meals
        if (deletedMeals.size > 0) {
          const mealStore = useMealStore.getState();
          const mealsToUpdate = usageMeals.filter((meal) => deletedMeals.has(meal.id));

          // Update all marked meals to remove the meal type association
          for (const meal of mealsToUpdate) {
            await mealStore.updateMeal(meal.id, {
              ...meal,
              mealTypeId: undefined,
            });
          }

          // Clear the deleted meals set
          setDeletedMeals(new Set());
          toast.success(`Удалено ${mealsToUpdate.length} связей с приёмами пищи`);
        }
      } else {
        // Создание нового типа
        await addMealType(editName);
        toast.success('Тип приёма пищи создан');
      }

      setIsInlineEditing(false);

      // Если это создание нового типа, сбрасываем состояние создания
      if (!mealType) {
        setIsEditing(false);
        onFinishEdit?.();
      }
    } catch (error) {
      console.error('Error saving meal type:', error);
      toast.error('Ошибка при сохранении типа приёма пищи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineCancel = () => {
    setIsInlineEditing(false);
    // Clear deleted meals set when cancelling edit
    setDeletedMeals(new Set());
    // Если это создание нового типа, сбрасываем и состояние создания
    if (!mealType) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  // Для нового типа показываем форму создания в режиме просмотра (не редактирования)
  if (!mealType) {
    // Показываем форму для создания нового типа в режиме просмотра
    return (
      <div className="pt-2">
        <div className="space-y-4">
          {/* Basic Info Section */}
          <CollapsibleSection
            id="create-basic-info"
            title="Основная информация"
            icon={<Info className="w-4 h-4 text-primary" />}
            isOpen={openSections.includes('create-basic-info')}
            onToggle={onToggleSection}
            gradientFrom="gradient-basic-info"
            gradientVia=""
            gradientTo=""
            actionButton={
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineCancel();
                  }}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineSave();
                  }}
                  disabled={isSubmitting || !editName.trim()}
                  icon={isSubmitting ? undefined : Save}
                  size="icon"
                >
                  {isSubmitting ? 'Сохранение...' : ''}
                </Button>
              </div>
            }
            disableToggle={true}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Введите название типа"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Введите описание (необязательно)"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  if (isEditing && mealType) {
    return (
      <div className="h-full">
        <MealTypeForm
          mealType={mealType}
          onSubmit={(_data) => {
            // Здесь будет логика сохранения
            setIsEditing(false);
            onFinishEdit?.();
          }}
          onCancel={() => {
            setIsEditing(false);
            onFinishEdit?.();
          }}
        />
      </div>
    );
  }

  // Calculate usage count and meals for the meal type
  const usageMeals = mealType
    ? useMealStore.getState().meals.filter((meal) => meal.mealTypeId === mealType.id)
    : [];
  const usageCount = usageMeals.length;

  // Calculate nutrition totals for a meal
  const _calculateMealNutrition = (meal: Meal) => {
    const products = useProductStore.getState().products;
    const dishes = useDishStore.getState().dishes;

    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0,
      totalWeight = 0;

    meal.items.forEach((item) => {
      const nutrition = calculateNutrition(item, products, dishes);
      if (nutrition) {
        totalCalories += nutrition.calories;
        totalProteins += nutrition.proteins;
        totalFats += nutrition.fats;
        totalCarbs += nutrition.carbs;
      }

      // Calculate weight
      if (item.type === 'product' && 'weight' in item) {
        totalWeight += Number(item.weight) || 0;
      } else if (item.type === 'dish') {
        // For dishes, we would need to calculate the total weight of all ingredients
        // For simplicity, we'll just count the number of items
        totalWeight += 100; // Placeholder value
      }
    });

    return {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins * 10) / 10,
      fats: Math.round(totalFats * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      weight: Math.round(totalWeight),
      itemsCount: meal.items.length,
    };
  };

  return (
    <div className="pt-2">
      <div className="space-y-4">
        {/* Basic Info Section */}
        <CollapsibleSection
          id="basic-info"
          title="Основная информация"
          icon={<Info className="w-4 h-4 text-primary" />}
          isOpen={openSections.includes('basic-info')}
          onToggle={onToggleSection}
          gradientFrom="gradient-basic-info"
          gradientVia=""
          gradientTo=""
          actionButton={
            !isInlineEditing && mealType ? (
              <Button
                type="button"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInlineEdit();
                }}
                icon={Edit}
                size="icon"
              >
                {/* Пусто - только иконка */}
              </Button>
            ) : isInlineEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineCancel();
                  }}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInlineSave();
                  }}
                  disabled={isSubmitting || !editName.trim()}
                  icon={isSubmitting ? undefined : Save}
                  size="icon"
                >
                  {isSubmitting ? 'Сохранение...' : ''}
                </Button>
              </div>
            ) : null
          }
          disableToggle={isInlineEditing}
        >
          <div className="space-y-4">
            {isInlineEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Введите название типа"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Введите описание (необязательно)"
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                  <div className="view-mode-field view-mode-single-line">
                    {mealType?.name || ''}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                  <div className="view-mode-field view-mode-multi-line">
                    {mealType?.description || 'Нет описания'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* Usage Section - только для существующих типов с приёмами пищи */}
        {mealType && usageCount > 0 && (
          <CollapsibleSection
            id="usage"
            title="Приёмы пищи" // Renamed from "Использование" to "Приёмы пищи"
            icon={<Tag className="w-4 h-4 text-green-600" />}
            isOpen={openSections.includes('usage')}
            onToggle={onToggleSection}
            gradientCssVar="var(--color-meal-type-gradient)" // Use MealType gradient for the section
            summaryContent={
              usageCount > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hash className="w-3.5 h-3.5" />
                  {usageCount}
                </span>
              )
            }
          >
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {usageMeals.length > 0 ? (
                  usageMeals
                    .filter((meal: Meal) => !deletedMeals.has(meal.id))
                    .map((meal: Meal) => {
                      // Calculate total nutrition for the meal
                      const products = useProductStore.getState().products;
                      const dishes = useDishStore.getState().dishes;

                      let totalCalories = 0,
                        totalProteins = 0,
                        totalFats = 0,
                        totalCarbs = 0,
                        totalWeight = 0;

                      meal.items.forEach((item: any) => {
                        const nutrition = calculateNutrition(item, products, dishes);
                        if (nutrition) {
                          totalCalories += nutrition.calories;
                          totalProteins += nutrition.proteins;
                          totalFats += nutrition.fats;
                          totalCarbs += nutrition.carbs;
                        }

                        // Calculate weight
                        if (item.type === 'product') {
                          totalWeight += Number(item.weight || 0);
                        } else if (item.type === 'dish') {
                          const dish = dishes.find((d) => d.id === item.itemId);
                          if (dish) {
                            totalWeight += Number(
                              dish.products.reduce((sum, dp) => sum + Number(dp.weight), 0)
                            );
                          }
                        }
                      });

                      return (
                        <div
                          key={meal.id}
                          data-meal-id={meal.id}
                          className="bg-card [background:var(--color-meal-composition-gradient)] border border-border rounded-xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                        >
                          <div className="space-y-1">
                            {/* Header Row */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Utensils className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <h4 className="font-medium text-foreground truncate">
                                  {meal.name}
                                </h4>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2">
                                {/* Nutrition block - expands to show all nutrition elements when clicked */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Stop propagation to prevent collapsing
                                    // Toggle nutrition details visibility using state
                                    setExpandedMeals((prev) => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(meal.id)) {
                                        newSet.delete(meal.id);
                                      } else {
                                        newSet.add(meal.id);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-md border border-border hover:bg-muted transition-all"
                                >
                                  {expandedMeals.has(meal.id) ? (
                                    <>
                                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-orange-600">
                                          {Math.round(totalCalories)}
                                        </span>
                                        <Flame className="w-4 h-4 text-orange-600" />
                                      </div>
                                      <div className="w-px h-4 bg-border" />
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-blue-600">
                                          {Math.round(totalProteins * 10) / 10}
                                        </span>
                                        <Beef className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-yellow-600">
                                          {Math.round(totalFats * 10) / 10}
                                        </span>
                                        <Droplet className="w-4 h-4 text-yellow-600" />
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-green-600">
                                          {Math.round(totalCarbs * 10) / 10}
                                        </span>
                                        <Wheat className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div className="w-px h-4 bg-border" />
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-muted-foreground">
                                          {Math.round(totalWeight)}
                                        </span>
                                        <Weight className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm font-semibold text-muted-foreground">
                                          {Math.round(totalWeight)}
                                        </span>
                                        <Weight className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    </>
                                  )}
                                </button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/meals?mealId=${meal.id}`);
                                  }}
                                  className="!border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600"
                                  title="Открыть приём пищи"
                                >
                                  <SquareArrowOutUpRight className="w-4 h-4" />
                                </Button>

                                {/* Delete button - only shown in edit mode */}
                                {isInlineEditing && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Optimistically remove meal from the list
                                      setDeletedMeals((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.add(meal.id);
                                        return newSet;
                                      });
                                      toast.success(
                                        'Приём пищи помечен для удаления. Нажмите "Сохранить" для подтверждения'
                                      );
                                    }}
                                    className="!border-danger/20 bg-danger/10 hover:bg-danger/15 text-danger"
                                    title="Удалить тип приёма пищи"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            {/* Removed detailed nutrition block as per requirements - only the button is needed */}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Нет приёмов пищи, использующих этот тип</p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};

export default MealTypeDetail;
