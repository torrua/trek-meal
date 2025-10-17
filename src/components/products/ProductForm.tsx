// src/components/products/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Component, Scale, Flame } from 'lucide-react';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import { toast } from 'react-hot-toast';
import type { Product, ProductData, ProductPortion, Category } from '../../types';

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: ProductData) => void;
  onCancel: () => void;
}

const INITIAL_STATE: ProductData = {
  name: '',
  description: '',
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
  isPerishable: false,
  packaging: '',
  categoryId: null,
  portions: [{ name: 'Стандартная', weight: 0 }],
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const { categories } = useCategoryStore();
  const [formData, setFormData] = useState<ProductData>(INITIAL_STATE);

  useEffect(() => {
    if (product) {
      const { id: _id, ...data } = product;
      setFormData({
        ...INITIAL_STATE,
        ...data,
        portions: data.portions?.length ? data.portions : [{ name: 'Стандартная', weight: 0 }],
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? isChecked : value }));
  };

  const handleSelectChange = (name: keyof ProductData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortionChange = (index: number, field: keyof ProductPortion, value: string) => {
    const newPortions = [...formData.portions];
    newPortions[index] = { ...newPortions[index], [field]: value };
    setFormData((prev) => ({ ...prev, portions: newPortions }));
  };

  const addPortion = () => {
    setFormData((prev) => ({ ...prev, portions: [...prev.portions, { name: '', weight: 0 }] }));
  };

  const removePortion = (index: number) => {
    if (formData.portions.length > 1) {
      setFormData((prev) => ({ ...prev, portions: prev.portions.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      formData.portions.some((p) => !String(p.weight).trim() || Number(p.weight) <= 0)
    ) {
      toast.error('Пожалуйста, заполните название и вес (больше нуля) для всех порций.');
      return;
    }
    onSubmit(formData);
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat: Category) => ({
      value: String(cat.id),
      label: cat.name,
    })),
  ];

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Component className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Основная информация
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Название продукта" required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                placeholder="Например, Гречневая крупа"
                className="text-base font-medium"
              />
            </FormField>

            <DropdownSelect
              label="Категория"
              icon={Component}
              options={categoryOptions}
              value={String(formData.categoryId || '')}
              onChange={(val) => typeof val === 'string' && handleSelectChange('categoryId', val)}
              placeholder="Выберите категорию"
            />
          </div>

          <FormField label="Описание">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание продукта, особенности приготовления..."
            />
          </FormField>
        </div>

        {/* Nutritional Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Пищевая ценность (на 100г)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="Калории (ккал)">
              <Input
                name="calories"
                type="number"
                value={formData.calories}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Белки (г)">
              <Input
                name="proteins"
                type="number"
                value={formData.proteins}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Жиры (г)">
              <Input
                name="fats"
                type="number"
                value={formData.fats}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Углеводы (г)">
              <Input
                name="carbs"
                type="number"
                value={formData.carbs}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
          </div>
        </div>

        {/* Product Properties Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border notion-border-subtle">
            <div className="flex items-center gap-3">
              <input
                id="isPerishable"
                name="isPerishable"
                type="checkbox"
                checked={formData.isPerishable}
                onChange={handleChange}
                className="w-4 h-4 rounded border notion-border-subtle text-primary focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
              <label
                htmlFor="isPerishable"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Скоропортящийся продукт
              </label>
            </div>
            <div className="text-xs text-muted-foreground">Требует особых условий хранения</div>
          </div>
        </div>

        {/* Portions Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Порции</h3>
          </div>

          <div className="space-y-4">
            {formData.portions.map((portion, index) => (
              <div
                key={index}
                className="flex items-end gap-3 p-4 bg-muted/30 rounded-xl border border-border"
              >
                <FormField label="Название порции" className="flex-1">
                  <Input
                    type="text"
                    placeholder="Например, 'Малая', 'Большая'"
                    value={portion.name}
                    onChange={(e) => handlePortionChange(index, 'name', e.target.value)}
                  />
                </FormField>
                <FormField label="Вес (г)" className="w-32 flex-shrink-0">
                  <Input
                    type="number"
                    placeholder="0"
                    value={portion.weight}
                    onChange={(e) => handlePortionChange(index, 'weight', e.target.value)}
                    required
                    min="0"
                  />
                </FormField>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePortion(index)}
                  disabled={formData.portions.length <= 1}
                  className="text-danger hover:bg-danger/10"
                  title="Удалить порцию"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addPortion}
            className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить порцию
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {product ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
