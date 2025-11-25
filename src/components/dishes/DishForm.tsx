// src/components/dishes/DishForm.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Soup,
  Component,
  Scale,
  ChefHat,
  PieChart,
  Circle,
  Info,
  Copy,
  RefreshCw,
  Edit,
} from 'lucide-react';
import DropdownSelect from '../../ui/DropdownSelect';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import type { Dish, DishData, DishProduct, Product, SubmitDishAction } from '../../types';
import { toast } from 'react-hot-toast';

interface DishFormProps {
  dish: Dish | null;
  dishToClone?: Dish | null;
  onSubmit: (data: DishData, action: SubmitDishAction) => void;
  onCancel: () => void;
}

type ProductOption = { value: string; label: string };
type PortionOption = { value: string; label: string; icon?: any };

const CUSTOM_WEIGHT_VALUE = '-1';

const DishForm: React.FC<DishFormProps> = ({ dish, dishToClone, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<DishProduct[]>([]);
  const { products: allProducts } = useProductStore();
  const { dishes } = useDishStore();

  useEffect(() => {
    const initializeState = (sourceDish: Dish, isCloning: boolean) => {
      // Если клонируем, добавляем пометку к имени, чтобы не было конфликта уникальности сразу
      setName(sourceDish.name + (isCloning ? ' (Вариация)' : ''));
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

  const confirmProductNavigation = () => {
    if (!dish) return true;
    return window.confirm('Несохранённые изменения будут потеряны. Продолжить?');
  };

  const handleNavigateToProduct = (productId: number) => {
    if (!confirmProductNavigation()) return;
    navigate(`/products?selectedId=${productId}`);
  };

  const productOptions: ProductOption[] = allProducts.map((p: Product) => ({
    value: String(p.id),
    label: p.name,
  }));

  const handleProductChange = (index: number, selectedValue: string) => {
    const newProducts = [...products];
    const productId = Number(selectedValue) || 0;
    newProducts[index].productId = productId;
    const product = allProducts.find((p: Product) => p.id === productId);
    newProducts[index].weight = product?.portions?.[0]?.weight || 0;
    setProducts(newProducts);
  };

  const handlePortionChange = (index: number, selectedValue: string) => {
    if (selectedValue !== undefined && selectedValue !== CUSTOM_WEIGHT_VALUE) {
      const newProducts = [...products];
      newProducts[index].weight = Number(selectedValue) || 0;
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
    // При клонировании (dishToClone) мы создаем НОВОЕ блюдо, поэтому проверяем конфликт с существующими
    // При редактировании (dish) исключаем текущее из проверки
    const isDuplicate = dishes.some(
      (d) => d.name.trim().toLowerCase() === trimmedName.toLowerCase() && d.id !== dish?.id
    );
    if (isDuplicate) {
      toast.error(
        `Блюдо с названием "${trimmedName}" уже существует. Пожалуйста, измените название вариации.`
      );
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

  const getTotalWeight = () => {
    return products.reduce((total, p) => total + (p.weight || 0), 0);
  };

  const getProductCount = () => {
    return products.filter((p) => p.productId > 0).length;
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Soup className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              {dishToClone ? 'Параметры вариации' : 'Основная информация'}
            </h3>
          </div>

          {dishToClone && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Создание новой версии</p>
                <p>
                  Вы редактируете копию. Оригинальное блюдо <strong>«{dishToClone.name}»</strong>{' '}
                  останется без изменений в базе данных.
                </p>
              </div>
            </div>
          )}

          <FormField label="Название вариации" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Например, Плов туристический (с тушенкой)"
              className="text-base font-medium"
            />
          </FormField>

          <FormField label="Описание">
            <Textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Описание блюда, способ приготовления, особенности..."
            />
          </FormField>
        </div>

        {/* Recipe Summary */}
        {(getProductCount() > 0 || getTotalWeight() > 0) && (
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Component className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Продуктов:</span>
                <span className="font-semibold text-primary">{getProductCount()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Общий вес:</span>
                <span className="font-semibold text-primary">{getTotalWeight()} г</span>
              </div>
            </div>
          </div>
        )}

        {/* Ingredients Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b notion-border-subtle">
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Состав блюда</h3>
            </div>
            {products.length === 0 && (
              <span className="text-sm text-muted-foreground">Добавьте продукты для рецепта</span>
            )}
          </div>

          <div className="space-y-4">
            {products.map((p, index) => {
              const selectedProduct = allProducts.find((prod: Product) => prod.id === p.productId);
              const portionOptions: PortionOption[] =
                selectedProduct?.portions.map((portion) => ({
                  value: String(portion.weight),
                  label: portion.name,
                  menuLabel: `${portion.name} (${portion.weight} г)`,
                  icon: portion.isIndivisible ? Circle : PieChart,
                })) || [];
              portionOptions.push({
                value: CUSTOM_WEIGHT_VALUE,
                label: 'Свой вес...',
                icon: PieChart,
              });

              const exactMatch = portionOptions.find((opt) => Number(opt.value) === p.weight);
              const currentPortion = exactMatch || portionOptions[portionOptions.length - 1];
              const SelectedIcon = currentPortion?.icon || PieChart;

              return (
                <div key={index} className="p-5 bg-muted/20 rounded-xl border notion-border-subtle">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Продукт {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedProduct && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleNavigateToProduct(selectedProduct.id)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
                            title="Перейти к продукту"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeProductField(index)}
                          className="text-muted-foreground hover:text-danger hover:bg-danger/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <DropdownSelect
                      label="Продукт"
                      icon={Component}
                      options={productOptions}
                      value={String(p.productId || '')}
                      onChange={(val) => typeof val === 'string' && handleProductChange(index, val)}
                      placeholder="Выберите продукт..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <DropdownSelect
                          label="Порция"
                          icon={SelectedIcon}
                          options={portionOptions}
                          value={currentPortion?.value || CUSTOM_WEIGHT_VALUE}
                          onChange={(val) =>
                            typeof val === 'string' && handlePortionChange(index, val)
                          }
                          disabled={!selectedProduct}
                          placeholder="Выберите порцию..."
                        />
                      </div>

                      <FormField label="Вес (г)" className="w-full">
                        <Input
                          type="number"
                          value={p.weight || ''}
                          onChange={(e) => handleWeightChange(index, e.target.value)}
                          required
                          min="0"
                          placeholder="Вес (г)"
                          icon={Scale}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={addProductField}
            className="w-full border-2 border-dashed notion-border-subtle hover:border-primary hover:bg-primary/5 py-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить продукт
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          {dishToClone ? (
            // Интерфейс выбора стратегии при клонировании
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
              <Button type="button" variant="secondary" onClick={() => handleAction('add_as_new')}>
                <Copy className="w-4 h-4 mr-2" />
                Добавить дополнительно
              </Button>
              <Button type="button" variant="primary" onClick={() => handleAction('replace')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Заменить в этом приёме пищи
              </Button>
            </div>
          ) : (
            // Стандартный интерфейс сохранения
            <>
              <Button type="button" variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => handleAction('create_or_update')}
              >
                <Soup className="w-4 h-4 mr-2" />
                {dish ? 'Сохранить' : 'Создать'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishForm;
