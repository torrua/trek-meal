// src/components/meals/MealForm.tsx
import React, { useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, GripVertical, Utensils, Info } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Meal, MealData, MealPlanItem, Product, Dish } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import Button from '../../ui/Button';
import ThemedSelect from '../../ui/ThemedSelect';

const mealFormSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        instanceId: z.string(),
        type: z.enum(['product', 'dish']),
        itemId: z.number(),
        weight: z.number().min(1, 'Вес должен быть больше 0').optional(),
      })
    )
    .min(1, 'Добавьте хотя бы один компонент'),
});

type MealFormValues = z.infer<typeof mealFormSchema>;

interface MealFormProps {
  meal?: Meal | null;
  onSubmit: (data: MealData) => void;
  onCancel: () => void;
}

const SortableItem: React.FC<{
  id: string;
  index: number;
  item: any;
  products: Product[];
  dishes: Dish[];
  onRemove: (index: number) => void;
  control: any;
  register: any;
}> = ({ id, index, item, products, dishes, onRemove, control, register }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const selectedItem =
    item.type === 'product'
      ? products.find((p) => p.id === item.itemId)
      : dishes.find((d) => d.id === item.itemId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-grow">
        <p className="font-medium text-sm">{selectedItem?.name}</p>
        <p className="text-xs text-muted-foreground">
          {item.type === 'product' ? 'Продукт' : 'Блюдо'}
        </p>
      </div>
      {item.type === 'product' && (
        <Controller
          name={`items.${index}.weight`}
          control={control}
          defaultValue={item.weight}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              className="w-24"
              placeholder="Вес, г"
              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
            />
          )}
        />
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(index)}
        className="text-muted-foreground hover:text-danger"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const MealForm: React.FC<MealFormProps> = ({ meal, onSubmit, onCancel }) => {
  const { products } = useProductStore();
  const { dishes } = useDishStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<MealFormValues>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name || '',
      description: meal?.description || '',
      items: meal?.items || [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  const groupedOptions = useMemo(() => {
    return [
      {
        label: 'Продукты',
        options: products.map((p) => ({ value: `product-${p.id}`, label: p.name })),
      },
      {
        label: 'Блюда',
        options: dishes.map((d) => ({ value: `dish-${d.id}`, label: d.name })),
      },
    ];
  }, [products, dishes]);

  const handleAddItem = (option: any) => {
    if (!option) return;
    const [type, idStr] = option.value.split('-');
    const itemId = parseInt(idStr, 10);

    append({
      instanceId: `${type}-${Date.now()}`,
      type: type as 'product' | 'dish',
      itemId,
      weight: type === 'product' ? 100 : undefined,
    });
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const processSubmit = (data: MealFormValues) => {
    const mealData: MealData = {
      name: data.name,
      description: data.description,
      items: data.items.map(({ instanceId, ...item }) => item) as MealPlanItem[],
    };
    onSubmit(mealData);
  };

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-6 p-1">
      <div className="p-6 bg-card border rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
        <div className="space-y-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Название приема пищи"
                error={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Textarea {...field} label="Краткое описание" rows={3} />}
          />
        </div>
      </div>

      <div className="p-6 bg-card border rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Состав</h2>
        <div className="space-y-3 mb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  item={watchItems[index]}
                  products={products}
                  dishes={dishes}
                  onRemove={remove}
                  control={control}
                  register={register}
                />
              ))}
            </SortableContext>
          </DndContext>
          {errors.items && (
            <p className="text-sm text-danger mt-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {errors.items.message || errors.items.root?.message}
            </p>
          )}
        </div>
        <ThemedSelect
          options={groupedOptions}
          onChange={handleAddItem}
          placeholder="Добавить продукт или блюдо..."
          value={null}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" icon={Utensils}>
          {meal ? 'Сохранить изменения' : 'Создать прием пищи'}
        </Button>
      </div>
    </form>
  );
};

export default MealForm;
