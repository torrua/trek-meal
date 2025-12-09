// src/components/dishes/DishDetail.tsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  Soup,
  Info,
  MapPin,
  Component,
  Hash,
  Search,
  AlertTriangle,
  Save,
  Copy,
  Plus,
  PieChart,
  Circle,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import type { Dish, DishProduct, Product, DishData } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import useCategoryStore from '../../stores/useCategoryStore';
import useTripStore from '../../stores/useTripStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import _DropdownSelect from '../../ui/DropdownSelect';
import SortableDishItem from './SortableDishItem';
import ProductContentReadOnly from './ProductContentReadOnly';
import _EditableProductNutrition from './EditableProductNutrition';
import Modal from '../../ui/Modal';
import NutritionButton from '../../ui/NutritionButton';
import CollapsibleSection from '../shared/CollapsibleSection';

interface DishDetailProps {
  dish: Dish | null;
  isCreating?: boolean; // Новый проп
  onEdit: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  onSaveNew?: (data: DishData) => void; // Коллбэк для сохранения нового
  onCancelCreation?: () => void; // Коллбэк для отмены создания
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
  onProductAdd?: (product: Product) => void; // New prop
}

const CUSTOM_WEIGHT_VALUE = '-1';

const DishDetail: React.FC<DishDetailProps> = ({
  dish,
  isCreating = false,
  onEdit: _onEdit,
  editTrigger,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  onSaveNew,
  onCancelCreation,
  editSubmitTrigger: _editSubmitTrigger,
  editCancelTrigger: _editCancelTrigger,
}) => {
  const navigate = useNavigate();
  const { products: allProducts } = useProductStore();
  const { removeProductFromDish, updateDish, addDish } = useDishStore();
  const { getTripsUsingDish } = useTripStore();
  const { categories } = useCategoryStore();
  const { searchByCategory } = useSettingsStore();

  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const editTriggerRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevIsCreatingRef = useRef<boolean>(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formProducts, setFormProducts] = useState<DishProduct[]>([]);

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');

  const isBasicInfoOpen = openSections.includes('basic-info');
  const isProductsOpen = openSections.includes('products');

  // Инициализация при смене режима isCreating
  useEffect(() => {
    if (isCreating) {
      setIsEditing(true);
      setName('');
      setDescription('');
      setFormProducts([]);
      onStartEdit?.();
    }
  }, [isCreating, onStartEdit]);

  // Переход из режима создания в режим просмотра
  useEffect(() => {
    // Срабатывает только при переходе из режима создания в режим просмотра
    if (prevIsCreatingRef.current && !isCreating && dish && isEditing) {
      setIsEditing(false);
      setName(dish.name || '');
      setDescription(dish.description || '');
      setFormProducts(JSON.parse(JSON.stringify(dish.products || [])));
      onFinishEdit?.();
    }
    // Обновляем ref
    prevIsCreatingRef.current = isCreating;
  }, [isCreating, dish, isEditing, onFinishEdit]);

  // Инициализация при смене блюда (только для режима просмотра)
  useEffect(() => {
    if (dish && !isCreating && !isEditing) {
      setName(dish.name || '');
      setDescription(dish.description || '');
      setFormProducts(JSON.parse(JSON.stringify(dish.products || [])));
    }
  }, [dish, dish?.id, isCreating, isEditing]);

  useEffect(() => {
    if (typeof editTrigger === 'number') {
      if (editTriggerRef.current !== undefined && editTriggerRef.current !== editTrigger) {
        setIsEditing(true);
        if (dish && !isCreating) {
          setName(dish?.name || '');
          setDescription(dish?.description || '');
          setFormProducts(JSON.parse(JSON.stringify(dish?.products || [])));
        }
        onStartEdit?.();
      }
      editTriggerRef.current = editTrigger;
    }
  }, [editTrigger, onStartEdit, dish, isCreating]);

  useEffect(() => {
    if (isEditing && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!openSections.includes('basic-info')) onToggleSection('basic-info');
    setIsEditing(true);
    setName(dish?.name || '');
    setDescription(dish?.description || '');
    setFormProducts(JSON.parse(JSON.stringify(dish?.products || [])));
    onStartEdit?.();
  };

  const handleCancelEdit = () => {
    if (isCreating) {
      onCancelCreation?.();
    } else {
      setIsEditing(false);
      setName(dish?.name || '');
      setDescription(dish?.description || '');
      setFormProducts(JSON.parse(JSON.stringify(dish?.products || [])));
      onFinishEdit?.();
    }
  };

  // Check if composition changed
  const hasCompositionChanged = useMemo(() => {
    if (isCreating) return false; // Для нового не проверяем изменение состава относительно "старого"
    if (!dish) return false;
    if (dish.products.length !== formProducts.length) return true;
    return JSON.stringify(dish.products) !== JSON.stringify(formProducts);
  }, [dish, formProducts, isCreating]);

  const handlePreSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Укажите название блюда');
      return;
    }
    const validProducts = formProducts.filter((p) => p.productId > 0 && p.weight > 0);
    if (validProducts.length === 0) {
      toast.error('Блюдо должно содержать хотя бы один продукт с весом > 0');
      return;
    }

    if (isCreating) {
      // Сохранение нового блюда
      onSaveNew?.({ name: trimmedName, description, products: validProducts });
      // Сбрасываем режим редактирования - родительский компонент переключит isCreating в false
      setIsEditing(false);
      return;
    }

    // Редактирование существующего
    // If products changed, show modal choice
    if (hasCompositionChanged) {
      setSaveAsName(`${trimmedName} (копия)`);
      setIsSaveModalOpen(true);
    } else {
      // Only text changed, simple update
      updateDish(dish?.id || 0, { name: trimmedName, description, products: validProducts });
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleConfirmSave = (action: 'replace' | 'new') => {
    if (!dish && !isCreating) return;

    const validProducts = formProducts.filter((p) => p.productId > 0 && p.weight > 0);

    if (action === 'replace' && dish) {
      updateDish(dish.id, { name, description, products: validProducts });
      toast.success('Блюдо обновлено');
      setIsSaveModalOpen(false);
      setIsEditing(false);
      onFinishEdit?.();
    } else {
      if (!saveAsName.trim()) {
        toast.error('Введите имя для нового блюда');
        return;
      }
      addDish({ name: saveAsName, description, products: validProducts });
      toast.success('Создано новое блюдо');
      setIsSaveModalOpen(false);
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const currentProducts = useMemo(
    () => (isEditing ? formProducts : dish ? dish.products : []),
    [isEditing, formProducts, dish]
  );

  const tripsUsingDish = dish && !isCreating ? getTripsUsingDish(dish.id) : [];
  const totalWeight = currentProducts.reduce((sum, p) => sum + p.weight, 0);

  const totalNutrition = useMemo(() => {
    let calories = 0,
      proteins = 0,
      fats = 0,
      carbs = 0;
    currentProducts.forEach((dishProduct) => {
      const product = allProducts.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = dishProduct.weight / 100;
        calories += (product.calories || 0) * weightRatio;
        proteins += (product.proteins || 0) * weightRatio;
        fats += (product.fats || 0) * weightRatio;
        carbs += (product.carbs || 0) * weightRatio;
      }
    });
    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
    };
  }, [currentProducts, allProducts]);

  const handleDeleteProduct = (productIndex: number) => {
    if (isEditing) {
      setFormProducts(formProducts.filter((_, i) => i !== productIndex));
    } else if (dish) {
      removeProductFromDish(dish.id, productIndex);
    }
  };

  const confirmProductNavigation = () => {
    if (!isEditing) return true;
    return window.confirm('Несохранённые изменения будут потеряны. Продолжить?');
  };

  const handleOpenProduct = (productId: number) => {
    if (!confirmProductNavigation()) return;
    navigate(`/products?selectedId=${productId}`);
  };

  const handleViewTrip = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  const handlePortionChange = (index: number, selectedValue: string) => {
    const newProducts = [...formProducts];
    if (selectedValue !== CUSTOM_WEIGHT_VALUE) {
      newProducts[index].weight = Number(selectedValue) || 0;
      setFormProducts(newProducts);
    }
  };

  const handleWeightChange = (index: number, weightStr: string) => {
    const newProducts = [...formProducts];
    newProducts[index].weight = parseInt(weightStr, 10) || 0;
    setFormProducts(newProducts);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = formProducts.findIndex((p) => p.productId === Number(active.id));
      const newIndex = formProducts.findIndex((p) => p.productId === Number(over?.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        setFormProducts((items) => arrayMove(items, oldIndex, newIndex));
      }
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    if (searchByCategory) {
      const matchingCategoryIds = categories
        .filter((c) => c.name.toLowerCase().includes(query))
        .map((c) => c.id);
      return allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.categoryId !== null && matchingCategoryIds.includes(p.categoryId))
      );
    }
    return allProducts.filter((p) => p.name.toLowerCase().includes(query));
  }, [allProducts, searchQuery, categories, searchByCategory]);

  const handleAddProduct = (productId: number) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      const defaultWeight = product.portions?.[0]?.weight || 100;
      setFormProducts([...formProducts, { productId, weight: defaultWeight }]);
      setSearchQuery('');
      setShowAddMenu(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideSearchArea = searchInputRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      if (!isInsideSearchArea && !isInsideDropdown) {
        setShowAddMenu(false);
        setSearchQuery('');
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAddMenu(false);
        setSearchQuery('');
      }
    };
    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showAddMenu]);

  // Если нет блюда и не режим создания, не рендерим ничего (или плейсхолдер снаружи)
  if (!dish && !isCreating) return null;

  return (
    <div className="space-y-6 pl-1" ref={containerRef}>
      {/* Basic Info Section */}
      <CollapsibleSection
        id="basic-info"
        title={isCreating ? 'Новое блюдо' : 'Основная информация'}
        icon={
          isCreating ? (
            <Plus className="w-4 h-4 text-primary" />
          ) : (
            <Info className="w-4 h-4 text-primary" />
          )
        }
        isOpen={isBasicInfoOpen}
        onToggle={onToggleSection}
        actionButton={
          isEditing ? (
            <div
              className="flex items-center gap-2 min-w-[280px] justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreSave();
                }}
                icon={Soup}
              >
                {isCreating ? 'Создать блюдо' : 'Сохранить изменения'}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                handleStartEdit();
              }}
              icon={Soup}
            >
              Редактировать
            </Button>
          )
        }
        gradientFrom="gradient-basic-info"
        gradientVia=""
        gradientTo=""
      >
        <div className="space-y-4 pt-4">
          {isEditing ? (
            <>
              <FormField label="Название блюда" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus={isCreating}
                  placeholder="Например, Плов"
                  className="text-base font-medium"
                />
              </FormField>
              <FormField label="Описание">
                <Textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Описание..."
                />
              </FormField>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Название блюда
                </label>
                <div className="view-mode-field view-mode-single-line">{dish?.name || ''}</div>
              </div>
              {dish?.description && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                  <div className="view-mode-field view-mode-multi-line">{dish?.description}</div>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

      {/* Products Section */}
      <CollapsibleSection
        id="products"
        title="Состав блюда"
        icon={<Soup className="w-4 h-4 text-primary" />}
        isOpen={isProductsOpen}
        onToggle={onToggleSection}
        summaryContent={
          currentProducts.length > 0 && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Hash className="w-3.5 h-3.5" />
              {currentProducts.length}
            </span>
          )
        }
        headerContent={
          currentProducts.length > 0 && (
            <NutritionButton
              calories={totalNutrition.calories}
              proteins={totalNutrition.proteins}
              fats={totalNutrition.fats}
              carbs={totalNutrition.carbs}
              weight={totalWeight}
            />
          )
        }
        gradientFrom="gradient-dish"
      >
        <div className="space-y-4 pt-4">
          {/* Search for adding products - доступен в режиме редактирования */}
          {isEditing && (
            <div className="relative mb-4" ref={searchInputRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsFocused(true);
                    setShowAddMenu(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  placeholder={!isFocused && !searchQuery ? 'Найти продукт или блюдо...' : ''}
                  className={
                    !isFocused && !searchQuery
                      ? 'text-center pl-10 focus:ring-primary'
                      : 'text-left pl-10 focus:ring-primary'
                  }
                />
              </div>
              {showAddMenu && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-card overflow-hidden z-50 max-h-[300px]"
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const scrollContainer = dropdownRef.current?.querySelector(
                      '.absolute-dropdown-scrollbar'
                    ) as HTMLElement;
                    if (scrollContainer && e instanceof WheelEvent) {
                      scrollContainer.scrollTop += e.deltaY;
                    }
                  }}
                  onTouchMove={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const scrollContainer = dropdownRef.current?.querySelector(
                      '.absolute-dropdown-scrollbar'
                    ) as HTMLElement;
                    if (scrollContainer) {
                      if ('deltaY' in e && typeof e.deltaY === 'number') {
                        scrollContainer.scrollTop += e.deltaY;
                      }
                    }
                  }}
                >
                  <div
                    className="p-2 absolute-dropdown-scrollbar"
                    tabIndex={0}
                    onTouchMove={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {filteredProducts.length === 0 ? (
                      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        Ничего не найдено
                      </div>
                    ) : (
                      <div>
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                          <Component className="w-3.5 h-3.5 text-blue-500" />
                          Продукты ({filteredProducts.length})
                        </div>
                        {filteredProducts.map((p) => {
                          const category = p.categoryId
                            ? categories.find((cat) => cat.id === p.categoryId)
                            : null;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleAddProduct(p.id)}
                              className="search-menu-item"
                            >
                              <Component className="w-3.5 h-3.5 text-blue-500" />
                              <span className="flex-1">{p.name}</span>
                              {category && (
                                <span className="text-muted-foreground text-xs flex items-center gap-1">
                                  {category.emoji} {category.name}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State for creation */}
          {isEditing && formProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
              <Soup className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Список продуктов пуст.</p>
              <p className="text-xs mt-1 opacity-70">
                Воспользуйтесь поиском выше, чтобы добавить ингредиенты.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {isEditing ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formProducts.map((p) => p.productId)}
                  strategy={verticalListSortingStrategy}
                >
                  {formProducts.map((p, index) => {
                    const selectedProduct = allProducts.find((prod) => prod.id === p.productId);
                    const portionOptions =
                      selectedProduct?.portions.map((port) => ({
                        value: String(port.weight),
                        label: port.name,
                        menuLabel: `${port.name} (${port.weight} г)`,
                        icon: port.isIndivisible ? Circle : PieChart,
                      })) || [];

                    // Добавляем "Свой вес..." только если текущий вес не соответствует стандартным порциям
                    const hasCustomWeight = !selectedProduct?.portions.some(
                      (port) => Number(port.weight) === Number(p.weight)
                    );
                    if (hasCustomWeight) {
                      portionOptions.push({
                        value: '-1',
                        label: 'Свой вес...',
                        menuLabel: 'Свой вес...',
                        icon: PieChart,
                      });
                    }

                    const currentPortion =
                      portionOptions.find((opt) => Number(opt.value) === p.weight) ||
                      portionOptions[portionOptions.length - 1];

                    return (
                      <SortableDishItem
                        key={p.productId}
                        product={p}
                        selectedProduct={selectedProduct}
                        portionOptions={portionOptions}
                        currentPortion={currentPortion}
                        index={index}
                        onPortionChange={handlePortionChange}
                        onWeightChange={handleWeightChange}
                        onDelete={handleDeleteProduct}
                        onViewProduct={handleOpenProduct}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>
            ) : (
              <>
                {currentProducts.map((dishProduct, index) => {
                  const product = allProducts.find((p) => p.id === dishProduct.productId);
                  if (!product) return null;
                  return (
                    <div key={index} className="gradient-product rounded-xl p-3">
                      <ProductContentReadOnly dishProduct={dishProduct} product={product} />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* Trips Section - Hide if creating */}
      {!isCreating && tripsUsingDish.length > 0 && (
        <CollapsibleSection
          id="trips"
          title="Поездки"
          icon={<MapPin className="h-4 w-4" />}
          isOpen={openSections.includes('trips')}
          onToggle={onToggleSection}
          gradientFrom="gradient-primary"
        >
          <div className="space-y-2">
            {tripsUsingDish.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-purple-500/10"
                onClick={() => handleViewTrip(t.id)}
              >
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-sm">{t.name}</span>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Save Strategy Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        title="Изменение состава блюда"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning/10 text-warning-foreground rounded-lg border border-warning/20">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Состав блюда был изменен.</p>
              <p>
                Это может повлиять на раскладку в походах, где используется это блюдо. Вы хотите
                перезаписать текущее блюдо или создать новое?
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Название нового блюда (для копии)
              </label>
              <Input
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="Введите название"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => handleConfirmSave('new')}
                className="w-full justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Сохранить как новое блюдо
              </Button>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground">ИЛИ</span>
                <div className="flex-grow border-t border-border"></div>
              </div>
              <Button
                variant="danger"
                onClick={() => handleConfirmSave('replace')}
                className="w-full justify-center bg-red-50 text-red-600 hover:bg-red-100 border-red-200 hover:border-red-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Перезаписать текущее (Опасно)
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DishDetail;
