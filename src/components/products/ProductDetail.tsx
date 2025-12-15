// src/components/products/ProductDetail.tsx

import React, { useState, useEffect } from 'react';
import {
  Info,
  Edit,
  Save,
  BarChart,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Hash,
  PieChart, // Для делимой порции и заголовка
  Circle, // Для неделимой порции
  Tag,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import useProductStore from '../../stores/useProductStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import InfoField from '../../ui/InfoField';
import cn from 'classnames';

// --- CollapsibleSection ---
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: (sectionId: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon,
  children,
  isOpen,
  onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} collapsible-section ${gradientFrom.includes('gradient-') ? gradientFrom : ''}`}
    >
      <div
        className="flex items-center justify-between gap-3 p-6 cursor-pointer"
        onClick={() => onToggle?.(id)}
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
      {isOpen && <div className="p-6 pt-0">{children}</div>}
    </div>
  );
};

// --- Основной компонент ---

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
  editTrigger?: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, editTrigger }) => {
  const { categories } = useCategoryStore();
  const { updateProduct } = useProductStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    calories: product?.calories || 0,
    proteins: product?.proteins || 0,
    fats: product?.fats || 0,
    carbs: product?.carbs || 0,
    isPerishable: product?.isPerishable || false,
    packaging: product?.packaging || '',
    categoryId: product?.categoryId || null,
    portions: product?.portions || [],
  });
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition', 'portions']);

  useEffect(() => {
    if (editTrigger && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        calories: product.calories || 0,
        proteins: product.proteins || 0,
        fats: product.fats || 0,
        carbs: product.carbs || 0,
        isPerishable: product.isPerishable || false,
        packaging: product.packaging || '',
        categoryId: product.categoryId || null,
        portions: product.portions || [],
      });
    }
  }, [product]);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? Number(value) : null,
    }));
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
      portions: [...prev.portions, { name: '', weight: 100, isIndivisible: false }],
    }));
  };

  const removePortion = (index: number) => {
    if (formData.portions.length > 1) {
      setFormData((prev) => ({ ...prev, portions: prev.portions.filter((_, i) => i !== index) }));
    }
  };

  const handleSave = () => {
    if (product && formData.name.trim()) {
      updateProduct(product.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        calories: product.calories || 0,
        proteins: product.proteins || 0,
        fats: product.fats || 0,
        carbs: product.carbs || 0,
        isPerishable: product.isPerishable || false,
        packaging: product.packaging || '',
        categoryId: product.categoryId || null,
        portions: product.portions || [],
      });
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    if (product) {
      setIsEditing(true);
    }
  };

  if (!product) return null;

  const category = categories.find((c: Category) => c.id === product.categoryId);

  return (
    <div className="pl-1">
      <CollapsibleSection
        id="info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('info')}
        onToggle={handleToggleSection}
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
                  handleSave();
                }}
                icon={Save}
                size="icon"
              >
                {/* Empty - only icon */}
              </Button>
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
            >
              {/* Empty - only icon */}
            </Button>
          )
        }
        gradientFrom="gradient-basic-info"
        gradientVia=""
        gradientTo=""
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Название</label>
            {isEditing ? (
              <FormField>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Название продукта"
                  className="text-base font-medium"
                />
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line">{product.name}</div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Категория</label>
            {isEditing ? (
              <FormField>
                <select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={(e) => handleSelectChange('categoryId', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                  aria-label="Категория продукта"
                >
                  <option value="">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                {category && (
                  <>
                    <Tag className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>{category.name}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {(isEditing || product.description) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
              {isEditing ? (
                <FormField>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Описание продукта (необязательно)"
                    rows={3}
                  />
                </FormField>
              ) : (
                <div className="view-mode-field view-mode-multi-line">{product.description}</div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 2. Пищевая ценность */}
      <CollapsibleSection
        id="nutrition"
        title="Пищевая ценность / 100 г."
        icon={<BarChart className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('nutrition')}
        onToggle={handleToggleSection}
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
                  handleSave();
                }}
                icon={Save}
                size="icon"
              >
                {/* Empty - only icon */}
              </Button>
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
            >
              {/* Empty - only icon */}
            </Button>
          )
        }
        gradientFrom="gradient-nutrition"
        gradientVia=""
        gradientTo=""
      >
        <div className="pt-4">
          {isEditing ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Калории</label>
                <FormField>
                  <Input
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-center"
                  />
                </FormField>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Белки</label>
                <FormField>
                  <Input
                    name="proteins"
                    type="number"
                    value={formData.proteins}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-center"
                  />
                </FormField>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Жиры</label>
                <FormField>
                  <Input
                    name="fats"
                    type="number"
                    value={formData.fats}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-center"
                  />
                </FormField>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Углеводы</label>
                <FormField>
                  <Input
                    name="carbs"
                    type="number"
                    value={formData.carbs}
                    onChange={handleChange}
                    placeholder="0"
                    className="text-center"
                  />
                </FormField>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoField
                icon={Flame}
                iconClassName="text-orange-600 bg-orange-100/50 dark:bg-orange-900/20"
                label="Калории"
                value={`${product.calories} ккал`}
              />
              <InfoField
                icon={Beef}
                iconClassName="text-blue-600 bg-blue-100/50 dark:bg-blue-900/20"
                label="Белки"
                value={`${product.proteins} г`}
              />
              <InfoField
                icon={Droplet}
                iconClassName="text-yellow-600 bg-yellow-100/50 dark:bg-yellow-900/20"
                label="Жиры"
                value={`${product.fats} г`}
              />
              <InfoField
                icon={Wheat}
                iconClassName="text-green-600 bg-green-100/50 dark:bg-green-900/20"
                label="Углеводы"
                value={`${product.carbs} г`}
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 3. Порции */}
      <CollapsibleSection
        id="portions"
        title="Порции"
        icon={<PieChart className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('portions')}
        onToggle={handleToggleSection}
        gradientFrom="gradient-product"
        gradientVia=""
        gradientTo=""
        summaryContent={
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Hash className="w-3.5 h-3.5" />
            {formData.portions.length}
          </span>
        }
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
                  handleSave();
                }}
                icon={Save}
                size="icon"
              >
                {/* Empty - only icon */}
              </Button>
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
            >
              {/* Empty - only icon */}
            </Button>
          )
        }
      >
        <div className="space-y-3 pt-4">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <>
              {product.portions.length > 0 ? (
                product.portions.map((portion: ProductPortion, index: number) => (
                  <div
                    key={index}
                    className="view-mode-field flex items-center justify-between px-4 py-3 hover:bg-card hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {/* Иконка: Circle для неделимой, PieChart для делимой */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center border',
                          portion.isIndivisible
                            ? 'bg-amber-100 text-amber-600 border-amber-200/50 dark:bg-amber-900/20'
                            : 'bg-purple-100 text-purple-600 border-purple-200/50 dark:bg-purple-900/20'
                        )}
                      >
                        {portion.isIndivisible ? (
                          <Circle className="w-4 h-4" />
                        ) : (
                          <PieChart className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{portion.name}</span>
                        {portion.isIndivisible && (
                          <span className="text-[10px] text-amber-600/80 font-medium leading-none mt-0.5">
                            Неделимая
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="view-mode-field view-mode-single-line min-w-[4rem] text-center">
                      {portion.weight} г
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm italic">
                  Порции не заданы
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ProductDetail;
