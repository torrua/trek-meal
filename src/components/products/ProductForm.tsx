// src/components/products/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
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
  calories: 0, proteins: 0, fats: 0, carbs: 0,
  isPerishable: false,
  packaging: '',
  categoryId: null,
  portions: [{ name: 'Стандартная', weight: 0 }]
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const { categories } = useCategoryStore();
  const [formData, setFormData] = useState<ProductData>(INITIAL_STATE);

  useEffect(() => {
    if (product) {
      const { id, ...data } = product;
      setFormData({ ...INITIAL_STATE, ...data, portions: data.portions?.length ? data.portions : [{ name: 'Стандартная', weight: 0 }] });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? isChecked : value }));
  };

  const handlePortionChange = (index: number, field: keyof ProductPortion, value: string) => {
    const newPortions = [...formData.portions];
    newPortions[index] = { ...newPortions[index], [field]: value };
    setFormData(prev => ({ ...prev, portions: newPortions }));
  };

  const addPortion = () => {
    setFormData(prev => ({ ...prev, portions: [...prev.portions, { name: '', weight: 0 }] }));
  };

  const removePortion = (index: number) => {
    if (formData.portions.length > 1) {
      setFormData(prev => ({ ...prev, portions: prev.portions.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.portions.some(p => !String(p.weight).trim() || Number(p.weight) <= 0)) {
        toast.error('Пожалуйста, заполните название и вес (больше нуля) для всех порций.');
        return;
    }
    onSubmit(formData);
  };
  
  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClassName}>Название *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={inputClassName} />
        </div>
        <div>
          <label htmlFor="categoryId" className={labelClassName}>Категория</label>
          <select id="categoryId" name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className={inputClassName}>
            <option value="">Без категории</option>
            {categories.map((cat: Category) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="packaging" className={labelClassName}>Упаковка</label>
        <select id="packaging" name="packaging" value={formData.packaging} onChange={handleChange} className={inputClassName}>
          <option value="">Без упаковки</option>
          <option value="Пакет">Пакет</option><option value="Банка">Банка</option>
          <option value="Коробка">Коробка</option><option value="Бутылка">Бутылка</option>
        </select>
      </div>
      <div>
        <label htmlFor="description" className={labelClassName}>Описание</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} className={inputClassName} />
      </div>

      <div>
        <label className={`${labelClassName} mb-2`}>Пищевая ценность (на 100г)</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Калории</label><input type="number" name="calories" value={formData.calories} onChange={handleChange} className={inputClassName} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Белки</label><input type="number" name="proteins" value={formData.proteins} onChange={handleChange} className={inputClassName} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Жиры</label><input type="number" name="fats" value={formData.fats} onChange={handleChange} className={inputClassName} /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Углеводы</label><input type="number" name="carbs" value={formData.carbs} onChange={handleChange} className={inputClassName} /></div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border">
        <input id="isPerishable" name="isPerishable" type="checkbox" checked={formData.isPerishable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="isPerishable" className="text-sm font-medium text-gray-700">Скоропортящийся продукт</label>
      </div>
      <div>
        <label className={`${labelClassName} mb-2`}>Порции *</label>
        <div className="space-y-3">
          {formData.portions.map((portion, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="text" placeholder="Название (напр. 'Малая')" value={portion.name} onChange={e => handlePortionChange(index, 'name', e.target.value)} className={inputClassName} />
              <input type="number" placeholder="Вес (г)" value={portion.weight} onChange={e => handlePortionChange(index, 'weight', e.target.value)} required className={`${inputClassName} w-32`} />
              <Button type="button" variant="danger" onClick={() => removePortion(index)} className="!px-3 !py-2" disabled={formData.portions.length <= 1}>–</Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={addPortion} className="mt-3">+ Добавить порцию</Button>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
        <Button type="submit" variant="primary">{product ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
}

export default ProductForm;