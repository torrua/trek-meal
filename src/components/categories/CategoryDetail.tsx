// src/components/categories/CategoryDetail.tsx

import React, { useState } from 'react';
import {
  Info,
  Edit,
  Save,
  Package,
  Hash,
  Flame,
  Beef,
  Droplet,
  Wheat,
  SquareArrowOutUpRight,
  Trash2,
  Component as ProductComponent,
  ChevronDown,
} from 'lucide-react';
import type { Category, Product } from '../../types';
import Button from '../../ui/Button';
import CategoryForm from './CategoryForm';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import useCategoryStore from '../../stores/useCategoryStore';
import useProductStore from '../../stores/useProductStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface CategoryDetailProps {
  category: Category | null;
  onEdit?: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
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
  gradientCssVar?: string; // New prop for direct CSS variable usage
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
  gradientCssVar, // New prop
  className,
  disableToggle = false,
}) => {
  const defaultShadow = 'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]';

  // Use CSS variable if provided, otherwise use Tailwind gradient classes
  const gradientClass = gradientCssVar
    ? `[background:${gradientCssVar}]`
    : `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`;

  return (
    <div
      className={`${className || 'border border-border'} ${defaultShadow} rounded-xl relative transform`}
    >
      <div className={`${gradientClass} rounded-xl absolute inset-0`}></div>
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

// Функция для проверки, является ли символ эмодзи
const _isValidEmoji = (str: string): boolean => {
  // Простое регулярное выражение для эмодзи
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/u;

  // Проверяем каждый символ в строке
  return str.split('').every((char) => emojiRegex.test(char));
};

const CategoryDetail: React.FC<CategoryDetailProps> = ({
  category,
  onEdit: _onEdit,
  editTrigger = 0,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger = 0,
  editCancelTrigger = 0,
  onEditProduct: _onEditProduct,
  onDeleteProduct: _onDeleteProduct,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<Set<number>>(new Set());
  const [showProductNutrition, setShowProductNutrition] = useState<Record<number, boolean>>({});
  const navigate = useNavigate();

  // Handler for emoji input with validation
  const _handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only emoji characters, max 2 characters
    if (value.length <= 2 && (value === '' || _isValidEmoji(value))) {
      setEditEmoji(value);
    }
  };

  const { updateCategory, addCategory } = useCategoryStore();
  const { products } = useProductStore();

  React.useEffect(() => {
    if (editTrigger > 0) {
      setIsEditing(true);
      setIsInlineEditing(true);
      setEditName('');
      setEditDescription('');
      setEditEmoji('');
      onStartEdit?.();
    }
  }, [editTrigger, onStartEdit]);

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
    if (category) {
      // Ensure the basic-info section is open when entering edit mode
      if (!openSections.includes('basic-info')) {
        onToggleSection('basic-info');
      }
      setEditName(category.name);
      setEditDescription(category.description || '');
      setEditEmoji(category.emoji || '');
      setIsInlineEditing(true);
    }
  };

  const handleInlineSave = async () => {
    try {
      setIsSubmitting(true);

      if (category) {
        // Редактирование существующей категории
        await updateCategory(category.id, {
          name: editName,
          description: editDescription,
          emoji: editEmoji,
        });
        toast.success('Категория обновлена');

        // Remove category associations from deleted products
        if (deletedProducts.size > 0) {
          const productsToUpdate = categoryProducts.filter((product) =>
            deletedProducts.has(product.id)
          );

          // Update all marked products to remove the category association
          for (const product of productsToUpdate) {
            await useProductStore.getState().updateProduct(product.id, {
              ...product,
              categoryId: undefined,
            });
          }

          // Clear the deleted products set
          setDeletedProducts(new Set());
          toast.success(`Удалено ${productsToUpdate.length} связей с продуктами`);
        }
      } else {
        // Создание новой категории
        await addCategory({
          name: editName,
          description: editDescription,
          emoji: editEmoji,
        });
        toast.success('Категория создана');
      }

      setIsInlineEditing(false);

      // Если это создание новой категории, сбрасываем состояние создания
      if (!category) {
        setIsEditing(false);
        onFinishEdit?.();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Ошибка при сохранении категории');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineCancel = () => {
    setIsInlineEditing(false);
    // Clear deleted products set when cancelling edit
    setDeletedProducts(new Set());
    // Если это создание новой категории, сбрасываем и состояние создания
    if (!category) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  // Для новой категории показываем форму создания в режиме просмотра (не редактирования)
  if (!category) {
    // Показываем форму для создания новой категории в режиме просмотра
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
            gradientFrom="from-blue-500/5"
            gradientVia="via-purple-500/5"
            gradientTo="to-pink-500/5"
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
                  placeholder="Введите название категории"
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Эмодзи</label>
                <Input
                  value={editEmoji}
                  onChange={_handleEmojiChange}
                  placeholder="Введите эмодзи (необязательно)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  if (isEditing && category) {
    return (
      <div className="h-full">
        <CategoryForm
          category={category}
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

  // Calculate usage count and products for the category
  const categoryProducts = category
    ? products.filter((product) => product.categoryId === category.id)
    : [];
  const usageCount = categoryProducts.length;

  return (
    <div className="space-y-4 pl-1">
      {/* Basic Info Section */}
      <CollapsibleSection
        id="basic-info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('basic-info')}
        onToggle={onToggleSection}
        gradientFrom="from-purple-500/5"
        gradientVia="via-yellow-500/5"
        gradientTo="to-pink-500/5"
        actionButton={
          !isInlineEditing && category ? (
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
                  placeholder="Введите название категории"
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Эмодзи</label>
                <Input
                  value={editEmoji}
                  onChange={_handleEmojiChange}
                  placeholder="Введите эмодзи (необязательно)"
                  disabled={isSubmitting}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                <div className="view-mode-field view-mode-single-line">{category?.name || ''}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                <div className="view-mode-field view-mode-multi-line">
                  {category?.description || 'Нет описания'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Эмодзи</label>
                <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                  {category?.emoji && <span className="text-lg">{category.emoji}</span>}
                  {category?.emoji || 'Нет эмодзи'}
                </div>
              </div>
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Usage Section - только для существующих категорий с продуктами */}
      {category && usageCount > 0 && (
        <CollapsibleSection
          id="usage"
          title="Продукты"
          icon={<ProductComponent className="w-4 h-4 text-blue-600" />}
          isOpen={openSections.includes('usage')}
          onToggle={onToggleSection}
          gradientCssVar="var(--color-meal-type-gradient)"
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
              {categoryProducts.length > 0 ? (
                categoryProducts
                  .filter((product: Product) => !deletedProducts.has(product.id))
                  .map((product: Product) => {
                    return (
                      <div
                        key={product.id}
                        data-product-id={product.id}
                        className="[background:var(--color-product-gradient)] border border-blue-500/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-xl transition-all duration-200 p-3 hover:bg-card-hover hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                      >
                        <div className="space-y-1">
                          {/* Header Row */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <ProductComponent className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              <h4 className="font-medium text-foreground truncate">
                                {product.name}
                              </h4>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              {/* Nutrition block */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowProductNutrition((prev) => ({
                                    ...prev,
                                    [product.id]: !prev[product.id],
                                  }));
                                }}
                                className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-md border border-border hover:bg-muted transition-all"
                              >
                                {showProductNutrition[product.id] ? (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-orange-600">
                                        {Math.round(product.calories || 0)}
                                      </span>
                                      <Flame className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="w-px h-4 bg-border" />
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-blue-600">
                                        {Math.round((product.proteins || 0) * 10) / 10}
                                      </span>
                                      <Beef className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-yellow-600">
                                        {Math.round((product.fats || 0) * 10) / 10}
                                      </span>
                                      <Droplet className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-green-600">
                                        {Math.round((product.carbs || 0) * 10) / 10}
                                      </span>
                                      <Wheat className="w-4 h-4 text-green-600" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm font-semibold text-orange-600">
                                        {Math.round(product.calories || 0)}
                                      </span>
                                      <Flame className="w-4 h-4 text-orange-600" />
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
                                  navigate(`/products?selectedId=${product.id}`);
                                }}
                                className="!border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/15 text-blue-600"
                                title="Открыть продукт"
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
                                    // Optimistically remove product from the list
                                    setDeletedProducts((prev) => {
                                      const newSet = new Set(prev);
                                      newSet.add(product.id);
                                      return newSet;
                                    });
                                    toast.success(
                                      'Продукт помечен для удаления. Нажмите "Сохранить" для подтверждения'
                                    );
                                  }}
                                  className="!border-danger/20 bg-danger/10 hover:bg-danger/15 text-danger"
                                  title="Удалить продукт из категории"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ProductComponent className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Нет продуктов в этой категории</p>
                </div>
              )}
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default CategoryDetail;
