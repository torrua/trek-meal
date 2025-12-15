import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Utensils, Hash, Edit, Save, Tag } from 'lucide-react';

import type { Meal, MealData, MealPlanItem } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import useMealStore from '../../stores/useMealStore';
import useMealTypesStore from '../../stores/useMealTypesStore';
import useCategoryStore from '../../stores/useCategoryStore';

import NutritionButton from '../../ui/NutritionButton';
import Button from '../../ui/Button';
import CollapsibleSection from '../../ui/CollapsibleSection';
import { calculateMealTotals } from '../../utils/nutritionUtils';

import MealBasicInfo from './form/MealBasicInfo';
import MealComposition from './form/MealComposition';
import MealItemContent from './MealItemContent';

interface MealDetailProps {
  meal: Meal | null;
  onEdit: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
  isCreating?: boolean;
  onSaveNew?: (data: MealData) => void;
  onCancelCreation?: () => void;
}

const validationSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  mealTypeId: z.string().optional(),
  items: z.array(z.any()).min(1, 'Добавьте хотя бы один продукт'),
});

type MealFormValues = z.infer<typeof validationSchema>;

// Тип для элемента с instanceId для внутреннего использования формы
type FormMealItem = MealPlanItem & { instanceId?: string };

const MealDetail: React.FC<MealDetailProps> = ({
  meal,
  onEdit: _onEdit,
  editTrigger,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger: _editSubmitTrigger,
  editCancelTrigger: _editCancelTrigger,
  isCreating = false,
  onSaveNew,
  onCancelCreation,
}) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { categories } = useCategoryStore();
  const { updateMeal } = useMealStore();
  const { mealTypes } = useMealTypesStore();

  const [isEditing, setIsEditing] = useState(isCreating);
  const editTriggerRef = useRef<number | undefined>(undefined);

  // Инициализация формы
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MealFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: meal?.name || '',
      description: meal?.description || '',
      mealTypeId: meal?.mealTypeId ? String(meal.mealTypeId) : '',
      items:
        meal?.items?.map((i) => ({
          ...i,
          instanceId:
            (i as FormMealItem).instanceId ||
            `${i.type}-${i.itemId}-${Math.random().toString(36).substr(2, 9)}`,
        })) || [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items') as FormMealItem[];

  // Эффект для переключения в режим редактирования извне
  useEffect(() => {
    if (isCreating) return;
    if (typeof editTrigger === 'number') {
      if (editTriggerRef.current !== undefined && editTriggerRef.current !== editTrigger) {
        setIsEditing(true);
        onStartEdit?.();
        reset({
          name: meal?.name || '',
          description: meal?.description || '',
          mealTypeId: meal?.mealTypeId ? String(meal.mealTypeId) : '',
          items:
            meal?.items?.map((i) => ({
              ...i,
              instanceId:
                (i as FormMealItem).instanceId ||
                `${i.type}-${i.itemId}-${Math.random().toString(36).substr(2, 9)}`,
            })) || [],
        });
      }
      editTriggerRef.current = editTrigger;
    }
  }, [editTrigger, onStartEdit, meal, reset, isCreating]);

  // Сброс формы при выборе другого приема пищи
  useEffect(() => {
    if (!isCreating && meal && !isEditing) {
      reset({
        name: meal.name,
        description: meal.description || '',
        mealTypeId: meal.mealTypeId ? String(meal.mealTypeId) : '',
        items: meal.items.map((i) => ({
          ...i,
          instanceId:
            (i as FormMealItem).instanceId ||
            `${i.type}-${i.itemId}-${Math.random().toString(36).substr(2, 9)}`,
        })),
      });
    }
  }, [meal, isCreating, reset, isEditing]);

  const totals = useMemo(() => {
    const itemsToCalculate = (isEditing ? watchItems : meal?.items || []).map(
      (item) => item as MealPlanItem
    );
    return calculateMealTotals(itemsToCalculate, products, dishes);
  }, [watchItems, meal?.items, products, dishes, isEditing]);

  if (!meal && !isCreating) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
    onStartEdit?.();
  };

  const handleCancel = () => {
    if (isCreating) {
      onCancelCreation?.();
    } else {
      setIsEditing(false);
      reset({
        name: meal?.name || '',
        description: meal?.description || '',
        mealTypeId: meal?.mealTypeId ? String(meal.mealTypeId) : '',
        items:
          meal?.items?.map((i) => ({
            ...i,
            instanceId:
              (i as FormMealItem).instanceId ||
              `${i.type}-${i.itemId}-${Math.random().toString(36).substr(2, 9)}`,
          })) || [],
      });
      onFinishEdit?.();
    }
  };

  const processSubmit = (data: MealFormValues) => {
    const mealTypeIdNumber =
      data.mealTypeId && data.mealTypeId !== '' ? Number(data.mealTypeId) : undefined;

    // Очищаем items от instanceId через деструктуризацию (используем _ чтобы линтер не ругался)
    const cleanItems = data.items.map(
      ({ instanceId: _instanceId, ...item }: any) => item
    ) as MealPlanItem[];

    const mealData: MealData = {
      name: data.name,
      description: data.description,
      mealTypeId: mealTypeIdNumber,
      items: cleanItems,
    };

    if (isCreating) {
      onSaveNew?.(mealData);
    } else if (meal) {
      updateMeal(meal.id, { ...meal, ...mealData });
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleAddItem = (itemId: number, type: 'product' | 'dish') => {
    let defaultWeight = 100;
    if (type === 'product') {
      const product = products.find((p) => p.id === itemId);
      defaultWeight =
        product && product.portions.length > 0 ? Number(product.portions[0].weight) : 100;
    } else if (type === 'dish') {
      const dish = dishes.find((d) => d.id === itemId);
      if (dish) {
        defaultWeight = Number(dish.products.reduce((sum, p) => sum + Number(p.weight), 0) || 100);
      }
    }
    append({
      instanceId: `${type}-${Date.now()}`,
      type,
      itemId,
      weight: Number(defaultWeight),
    });
  };

  const handleUpdateWeight = (index: number, weight: number) => {
    if (watchItems[index]) {
      update(index, { ...watchItems[index], weight: Number(weight) });
    }
  };

  const handleEditNestedItem = () => {
    /* Placeholder for future edit functionality */
  };

  const isBasicInfoOpen = openSections.includes('basic-info');
  const isCompositionOpen = openSections.includes('composition');

  const singleLineFieldStyle =
    'h-10 flex items-center px-4 rounded-lg border border-border bg-card text-foreground shadow-sm text-base sm:text-sm';
  const multiLineFieldStyle =
    'w-full px-4 py-2.5 min-h-[80px] rounded-lg border border-border bg-card text-foreground shadow-sm text-base sm:text-sm whitespace-pre-wrap';

  return (
    <div className="space-y-6 relative isolate">
      {/* --- Блок: Основная информация --- */}
      <CollapsibleSection
        id="basic-info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={isBasicInfoOpen}
        onToggle={onToggleSection}
        showBorder={false}
        actionButton={
          isEditing ? (
            <div className="flex items-center gap-2 min-w-[280px] justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit(processSubmit)();
                }}
                icon={Save}
                size="icon"
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit();
              }}
              icon={Edit}
              size="icon"
            />
          )
        }
        gradientFrom="gradient-basic-info"
      >
        {isEditing ? (
          <MealBasicInfo
            control={control}
            errors={errors}
            mealTypes={mealTypes}
            isNew={isCreating}
          />
        ) : (
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Название <span className="text-danger">*</span>
              </label>
              <div className={singleLineFieldStyle}>{meal?.name}</div>
            </div>

            {meal?.mealTypeId && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Тип</label>
                <div className={singleLineFieldStyle}>
                  <Tag className="w-4 h-4 text-muted-foreground mr-2.5 flex-shrink-0" />
                  {mealTypes.find((mt) => mt.id === meal.mealTypeId)?.name}
                </div>
              </div>
            )}

            {meal?.description && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-foreground">Описание</label>
                <div className="relative">
                  <div className={multiLineFieldStyle}>{meal.description}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* --- Блок: Состав --- */}
      <CollapsibleSection
        id="composition"
        title="Состав"
        icon={<Utensils className="w-4 h-4 text-primary" />}
        isOpen={isCompositionOpen}
        onToggle={onToggleSection}
        showBorder={false}
        summaryContent={
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Hash className="w-3.5 h-3.5" />
            {isEditing ? fields.length : meal?.items.length || 0}
          </span>
        }
        headerContent={
          <NutritionButton
            calories={totals.calories}
            proteins={totals.proteins}
            fats={totals.fats}
            carbs={totals.carbs}
            weight={totals.weight}
          />
        }
        gradientFrom="gradient-meal"
      >
        {isEditing ? (
          <div className="pt-4">
            <MealComposition
              fields={fields}
              items={watchItems}
              products={products}
              dishes={dishes}
              categories={categories}
              onAdd={handleAddItem}
              onRemove={remove}
              onUpdateWeight={handleUpdateWeight}
              onMove={move}
              onEditItem={handleEditNestedItem}
            />
          </div>
        ) : (
          <div className="space-y-3 pt-4">
            {(meal?.items.length || 0) > 0 ? (
              meal?.items.map((item, index) => {
                const isProduct = item.type === 'product';
                const itemStyle = isProduct ? 'gradient-product' : 'gradient-dish';
                return (
                  <div
                    key={`${item.type}-${item.itemId}-${index}`}
                    className={`${itemStyle} rounded-xl p-3 shadow-sm`}
                  >
                    <MealItemContent
                      item={item}
                      products={products}
                      dishes={dishes}
                      readOnly={true}
                      showActions={false}
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Список пуст</p>
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default MealDetail;
