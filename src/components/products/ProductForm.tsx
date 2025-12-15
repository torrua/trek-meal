// src/components/products/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Component, Flame, Info, PieChart, Circle } from 'lucide-react'; // Импорт новых иконок
import useCategoryStore from '../../stores/useCategoryStore';
import useProductStore from '../../stores/useProductStore';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import CollapsibleSection from '../../ui/CollapsibleSection';
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
  portions: [{ name: 'Стандартная', weight: 100, isIndivisible: false }],
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const { categories } = useCategoryStore();
  const { updateProduct, addProduct } = useProductStore();
  const [formData, setFormData] = useState<ProductData>(INITIAL_STATE);

  useEffect(() => {
    if (product) {
      const { id: _id, ...data } = product;
      setFormData({
        ...INITIAL_STATE,
        ...data,
        portions: data.portions?.length
          ? data.portions
          : [{ name: 'Стандартная', weight: 100, isIndivisible: false }],
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

  const handlePortionChange = (
    index: number,
    field: keyof ProductPortion,
    value: string | boolean
  ) => {
    const newPortions = [...formData.portions];
    newPortions[index] = { ...newPortions[index], [field]: value };
    setFormData((prev) => ({ ...prev, portions: newPortions }));
  };

  const addPortion = () => {
    setFormData((prev) => ({
      ...prev,
      portions: [...prev.portions, { name: '', weight: 0, isIndivisible: false }],
    }));
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

    if (product) {
      updateProduct(product.id, formData);
    } else {
      addProduct(formData);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Section */}
      <CollapsibleSection
        id="basic-info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={true}
        actionButton={
          <div className="flex items-center gap-2 min-w-[280px] justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit(e);
              }}
              icon={Component}
            >
              {product ? 'Сохранить изменения' : 'Создать продукт'}
            </Button>
          </div>
        }
        gradientFrom="gradient-basic-info"
      >
        <div className="space-y-4 pt-4">
          <FormField label="Название продукта" required>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              autoFocus
              placeholder="Например, Гречневая крупа"
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

          <FormField label="Описание">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание продукта, особенности приготовления..."
            />
          </FormField>

          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Input
                  id="isPerishable"
                  name="isPerishable"
                  type="checkbox"
                  checked={formData.isPerishable}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isPerishable"
                  className="text-sm font-medium text-foreground cursor-pointer ml-2"
                >
                  Скоропортящийся продукт
                </label>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Требует особых условий хранения</div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Nutritional Information Section */}
      <div className="p-6 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-green-500/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Flame className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Пищевая ценность / 100 г.</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <FormField label="Калории (ккал)">
            <Input
              name="calories"
              type="number"
              value={formData.calories}
              onChange={handleChange}
              min="0"
              step="0.1"
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
              step="0.1"
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
              step="0.1"
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
              step="0.1"
              placeholder="0"
            />
          </FormField>
        </div>
      </div>

      {/* Portions Section */}
      <div className="p-6 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-xl">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <PieChart className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Порции</h2>
        </div>

        <div className="space-y-3 pt-4">
          {formData.portions.map((portion, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-end gap-3">
                  <FormField label="Название" className="flex-1">
                    <Input
                      type="text"
                      placeholder="Например, 'Банка'"
                      value={portion.name}
                      onChange={(e) => handlePortionChange(index, 'name', e.target.value)}
                    />
                  </FormField>
                  <FormField label="Вес (г)" className="w-28 flex-shrink-0">
                    <Input
                      type="number"
                      placeholder="0"
                      value={portion.weight}
                      onChange={(e) => handlePortionChange(index, 'weight', e.target.value)}
                      required
                      min="0"
                    />
                  </FormField>
                </div>

                {/* Чекбокс Неделимая */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center">
                    <Input
                      type="checkbox"
                      id={`indivisible-${index}`}
                      checked={portion.isIndivisible || false}
                      onChange={(e) =>
                        handlePortionChange(index, 'isIndivisible', e.target.checked)
                      }
                      className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                    />
                    <label
                      htmlFor={`indivisible-${index}`}
                      className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1 select-none ml-2"
                    >
                      <Circle className="w-3 h-3" />
                      Неделимая порция
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-start h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePortion(index)}
                  disabled={formData.portions.length <= 1}
                  className="text-danger hover:bg-danger/10 mt-6"
                  title="Удалить порцию"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

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
      </div>
    </form>
  );
};

export default ProductForm;
