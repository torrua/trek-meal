// src/components/database/dishes/DishForm.tsx

import React, { useState, useEffect } from 'react';
import { SingleValue } from 'react-select';
import ThemedSelect from '../../ui/ThemedSelect';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import type { Dish, DishData, DishProduct, Product, SubmitDishAction } from '../../types';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface DishFormProps {
  dish: Dish | null;
  dishToClone?: Dish | null;
  onSubmit: (data: DishData, action: SubmitDishAction) => void;
  onCancel: () => void;
}

type ProductOption = { value: number; label: string };
type PortionOption = { value: number; label: string };

const CUSTOM_WEIGHT_VALUE = -1;

const DishForm: React.FC<DishFormProps> = ({ dish, dishToClone, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<DishProduct[]>([]);
  const { products: allProducts } = useProductStore();
  const { dishes } = useDishStore();

  useEffect(() => {
    const initializeState = (sourceDish: Dish, isCloning: boolean) => {
      setName(sourceDish.name + (isCloning ? ' (копия)' : ''));
      setDescription(sourceDish.description || '');
      setProducts(JSON.parse(JSON.stringify(sourceDish.products)));
    };

    if (dish) {
      initializeState(dish, false);
      return;
    }
    if (dishToClone) {
      initializeState(dishToClone, true);
      return;
    }

    setName('');
    setDescription('');
    setProducts([]);
  }, [dish, dishToClone]);

  const productOptions: ProductOption[] = allProducts.map((p: Product) => ({
    value: p.id,
    label: p.name,
  }));

  const handleProductChange = (index: number, selectedOption: SingleValue<ProductOption>) => {
    const newProducts = [...products];
    const productId = selectedOption?.value || 0;
    newProducts[index].productId = productId;
    const product = allProducts.find((p: Product) => p.id === productId);
    newProducts[index].weight = product?.portions?.[0]?.weight || 0;
    setProducts(newProducts);
  };

  const handlePortionChange = (index: number, selectedOption: SingleValue<PortionOption>) => {
    const weight = selectedOption?.value;
    if (weight !== undefined && weight !== CUSTOM_WEIGHT_VALUE) {
      const newProducts = [...products];
      newProducts[index].weight = weight;
      setProducts(newProducts);
    }
  };

  const handleWeightChange = (index: number, weightStr: string) => {
    const newProducts = [...products];
    newProducts[index].weight = parseInt(weightStr, 10) || 0;
    setProducts(newProducts);
  };

  const addProductField = () => setProducts([...products, { productId: 0, weight: 0 }]);
  const removeProductField = (index: number) => setProducts(products.filter((_, i) => i !== index));

  const validateAndGetData = (): DishData | null => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Пожалуйста, укажите название блюда.');
      return null;
    }
    const isDuplicate = dishes.some(
      (d) => d.name.trim().toLowerCase() === trimmedName.toLowerCase() && d.id !== dish?.id
    );
    if (isDuplicate) {
      toast.error(`Блюдо с названием "${trimmedName}" уже существует.`);
      return null;
    }
    const validProducts = products.filter((p) => p.productId > 0 && p.weight > 0);
    if (validProducts.length === 0) {
      toast.error('Блюдо должно содержать хотя бы один продукт с весом больше нуля.');
      return null;
    }
    return { name: trimmedName, description: description.trim(), products: validProducts };
  };

  const handleAction = (action: SubmitDishAction) => {
    const data = validateAndGetData();
    if (data) {
      onSubmit(data, action);
    }
  };

  return (
    <div className="p-1 space-y-6">
      <Input
        label="Название блюда *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />

      <Textarea
        label="Описание"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="Описание блюда, способ приготовления, особенности..."
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Состав *
        </label>
        <div className="space-y-4">
          {products.map((p, index) => {
            const selectedProduct = allProducts.find((prod: Product) => prod.id === p.productId);
            const portionOptions: PortionOption[] =
              selectedProduct?.portions.map((portion) => ({
                value: portion.weight,
                label: `${portion.name} (${portion.weight} г)`,
              })) || [];
            portionOptions.push({ value: CUSTOM_WEIGHT_VALUE, label: 'Свой вес...' });
            const currentPortion =
              portionOptions.find((opt) => opt.value === p.weight) ||
              portionOptions.find((opt) => opt.value === CUSTOM_WEIGHT_VALUE);
            return (
              <div key={index}>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                  <ThemedSelect<ProductOption>
                    className="w-full"
                    options={productOptions}
                    value={productOptions.find((opt) => opt.value === p.productId)}
                    onChange={(opt) => handleProductChange(index, opt)}
                    placeholder="Выберите продукт..."
                    menuPortalTarget={document.body}
                  />
                  <div className="flex items-center gap-2">
                    <ThemedSelect<PortionOption>
                      className="flex-grow"
                      options={portionOptions}
                      value={currentPortion}
                      onChange={(opt) => handlePortionChange(index, opt)}
                      isDisabled={!selectedProduct}
                      placeholder="Порция..."
                      menuPortalTarget={document.body}
                    />
                    <Input
                      type="number"
                      value={p.weight || ''}
                      onChange={(e) => handleWeightChange(index, e.target.value)}
                      required
                      min="0"
                      className="w-24 text-center"
                      containerClassName="w-24 flex-shrink-0"
                      placeholder="Вес (г)"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      size="icon"
                      onClick={() => removeProductField(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < products.length - 1 && (
                  <div className="flex items-center my-4">
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="px-3 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                      И
                    </span>
                    <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Button type="button" variant="ghost" onClick={addProductField} className="mt-3">
          + Добавить продукт
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        {dishToClone ? (
          <>
            <Button type="button" variant="secondary" onClick={() => handleAction('add_as_new')}>
              Добавить как новое
            </Button>
            <Button type="button" variant="primary" onClick={() => handleAction('replace')}>
              Заменить в раскладке
            </Button>
          </>
        ) : (
          <Button type="button" variant="primary" onClick={() => handleAction('create_or_update')}>
            {dish ? 'Сохранить' : 'Создать'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DishForm;
