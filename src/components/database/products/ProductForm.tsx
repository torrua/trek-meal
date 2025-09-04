// src/components/database/products/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { Tag, Trash2 } from 'lucide-react';
import useCategoryStore from '../../../stores/useCategoryStore';
import Button from '../../../ui/Button';
import { toast } from 'react-hot-toast';
import type { Product, ProductData, ProductPortion, Category } from '../../../types';
import Input from '../../../ui/Input';
import DropdownSelect from '../../../ui/DropdownSelect';
import Textarea from '../../../ui/Textarea';

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
      icon: () => <span className="text-lg">{cat.emoji}</span>,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Название *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          autoFocus
        />
        <DropdownSelect
          label="Категория"
          icon={Tag}
          value={String(formData.categoryId || '')}
          onChange={(value) => handleSelectChange('categoryId', value)}
          options={categoryOptions}
        />
      </div>

      <Textarea
        label="Описание"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={2}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Пищевая ценность (на 100г)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Калории"
            name="calories"
            type="number"
            value={formData.calories}
            onChange={handleChange}
            min="0"
          />
          <Input
            label="Белки"
            name="proteins"
            type="number"
            value={formData.proteins}
            onChange={handleChange}
            min="0"
          />
          <Input
            label="Жиры"
            name="fats"
            type="number"
            value={formData.fats}
            onChange={handleChange}
            min="0"
          />
          <Input
            label="Углеводы"
            name="carbs"
            type="number"
            value={formData.carbs}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <input
          id="isPerishable"
          name="isPerishable"
          type="checkbox"
          checked={formData.isPerishable}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="isPerishable"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Скоропортящийся продукт
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Порции *
        </label>
        <div className="space-y-3">
          {formData.portions.map((portion, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Название (напр. 'Малая')"
                value={portion.name}
                onChange={(e) => handlePortionChange(index, 'name', e.target.value)}
                containerClassName="flex-grow"
              />
              <Input
                type="number"
                placeholder="Вес (г)"
                value={portion.weight}
                onChange={(e) => handlePortionChange(index, 'weight', e.target.value)}
                required
                min="0"
                containerClassName="w-32 flex-shrink-0"
              />
              <Button
                type="button"
                variant="danger"
                size="icon"
                onClick={() => removePortion(index)}
                disabled={formData.portions.length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={addPortion} className="mt-3">
          + Добавить порцию
        </Button>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          {product ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
