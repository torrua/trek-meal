// src/components/dishes/DishDetail.tsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Edit,
  Soup,
  Info,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  MapPin,
  Component,
  ChevronDown,
  Hash,
  X,
  Plus,
  Trash2,
  Search,
  Box,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dish, DishData, DishProduct, Product } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore';
import Button from '../../ui/Button';
import EditPortionModal from './EditPortionModal';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import DropdownSelect from '../../ui/DropdownSelect';
import { tripEntityConfig } from '../../config/entityConfig';
import { toast } from 'react-hot-toast';

interface DishDetailProps {
  dish: Dish | null;
  onEdit: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
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
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border rounded-xl overflow-visible`}
    >
      <div
        className="flex items-center justify-between gap-3 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => onToggle(id)}
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
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {isOpen && <div className="p-6 pt-0 overflow-visible">{children}</div>}
    </div>
  );
};

const ProductContentReadOnly: React.FC<{
  dishProduct: DishProduct;
  product: Product;
  onEditPortion: () => void;
  onRemove: () => void;
  onView: () => void;
  canRemove: boolean;
}> = ({ dishProduct, product, onEditPortion, onRemove, onView, canRemove }) => {
  const [showNutrition, setShowNutrition] = useState(false);

  const nutrition = useMemo(() => {
    if (!product || !dishProduct.weight) return null;
    const multiplier = dishProduct.weight / 100;
    return {
      calories: Math.round((product.calories || 0) * multiplier),
      proteins: Math.round((product.proteins || 0) * multiplier * 10) / 10,
      fats: Math.round((product.fats || 0) * multiplier * 10) / 10,
      carbs: Math.round((product.carbs || 0) * multiplier * 10) / 10,
    };
  }, [product, dishProduct.weight]);

  const portion = useMemo(() => {
    if (!product || !dishProduct.weight) return null;
    return product.portions?.find((p) => p.weight === dishProduct.weight);
  }, [product, dishProduct.weight]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Component className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <h4
            className="font-medium text-foreground truncate hover:text-primary cursor-pointer transition-colors"
            onClick={onView}
          >
            {product.name}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {nutrition && dishProduct.weight && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowNutrition(!showNutrition);
              }}
              className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all"
            >
              {showNutrition ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-600">
                      {nutrition.calories}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1">
                    <Beef className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      {nutrition.proteins}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplet className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-600">{nutrition.fats}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wheat className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">{nutrition.carbs}</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {dishProduct.weight}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {dishProduct.weight}
                    </span>
                  </div>
                </>
              )}
            </button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEditPortion();
            }}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600"
            title="Изменить вес"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="bg-danger/10 hover:bg-danger/20 text-danger"
              title="Удалить продукт"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {dishProduct.weight && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg">
            <Weight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground">
              {portion ? portion.name : 'Другая порция'}
            </span>
            <span className="text-muted-foreground">({dishProduct.weight} г)</span>
          </div>
        </div>
      )}
    </div>
  );
};

const CUSTOM_WEIGHT_VALUE = '-1';

const DishDetail: React.FC<DishDetailProps> = ({
  dish,
  onEdit: _onEdit,
  editTrigger,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger: _editSubmitTrigger,
  editCancelTrigger: _editCancelTrigger,
}) => {
  const navigate = useNavigate();
  const { products: allProducts } = useProductStore();
  const { removeProductFromDish, updateProductInDish, updateDish, dishes } = useDishStore();
  const { getTripsUsingDish } = useTripStore();

  const [editingPortionIndex, setEditingPortionIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHeaderNutrition, setShowHeaderNutrition] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const editTriggerRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formProducts, setFormProducts] = useState<DishProduct[]>([]);

  useEffect(() => {
    if (typeof editTrigger === 'number') {
      if (editTriggerRef.current !== undefined && editTriggerRef.current !== editTrigger) {
        setIsEditing(true);
        if (dish) {
          setName(dish.name);
          setDescription(dish.description || '');
          setFormProducts(JSON.parse(JSON.stringify(dish.products)));
        }
        onStartEdit?.();
      }
      editTriggerRef.current = editTrigger;
    }
  }, [editTrigger, onStartEdit, dish]);

  useEffect(() => {
    if (isEditing && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!openSections.includes('basic-info')) onToggleSection('basic-info');
    setIsEditing(true);
    setName(dish.name);
    setDescription(dish.description || '');
    setFormProducts(JSON.parse(JSON.stringify(dish.products)));
    onStartEdit?.();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(dish.name);
    setDescription(dish.description || '');
    setFormProducts(JSON.parse(JSON.stringify(dish.products)));
    onFinishEdit?.();
  };

  const validateAndSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Пожалуйста, укажите название блюда.');
      return;
    }
    const isDuplicate = dishes.some(
      (d) => d.name.trim().toLowerCase() === trimmedName.toLowerCase() && d.id !== dish.id
    );
    if (isDuplicate) {
      toast.error(`Блюдо с названием "${trimmedName}" уже существует.`);
      return;
    }
    const validProducts = formProducts.filter((p) => p.productId > 0 && p.weight > 0);
    if (validProducts.length === 0) {
      toast.error('Блюдо должно содержать хотя бы один продукт с весом больше нуля.');
      return;
    }

    const data: DishData = {
      name: trimmedName,
      description: description.trim(),
      products: validProducts,
    };

    updateDish(dish.id, data);
    setIsEditing(false);
    onFinishEdit?.();
  };

  const currentProducts = useMemo(
    () => (isEditing ? formProducts : dish ? dish.products : []),
    [isEditing, formProducts, dish?.products]
  );

  const tripsUsingDish = dish ? getTripsUsingDish(dish.id) : [];

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
    } else {
      removeProductFromDish(dish.id, productIndex);
    }
  };

  const handleEditPortion = (productIndex: number) => {
    setEditingPortionIndex(productIndex);
  };

  const handleSavePortion = (newWeight: number) => {
    if (editingPortionIndex !== null) {
      if (isEditing) {
        const newProducts = [...formProducts];
        newProducts[editingPortionIndex].weight = newWeight;
        setFormProducts(newProducts);
      } else if (dish) {
        updateProductInDish(dish.id, editingPortionIndex, newWeight);
      }
    }
    setEditingPortionIndex(null);
  };

  const handleClosePortionModal = () => {
    setEditingPortionIndex(null);
  };

  const handleOpenProduct = (productId: number) => {
    navigate(`/products?selectedId=${productId}`);
  };

  const handleViewTrip = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  // Form handlers
  const productOptions = allProducts.map((p: Product) => ({
    value: String(p.id),
    label: p.name,
  }));

  const handleProductChange = (index: number, selectedValue: string) => {
    const newProducts = [...formProducts];
    const productId = Number(selectedValue) || 0;
    newProducts[index].productId = productId;
    const product = allProducts.find((p: Product) => p.id === productId);
    newProducts[index].weight = product?.portions?.[0]?.weight || 0;
    setFormProducts(newProducts);
  };

  const handlePortionChange = (index: number, selectedValue: string) => {
    if (selectedValue !== undefined) {
      const newProducts = [...formProducts];
      if (selectedValue !== CUSTOM_WEIGHT_VALUE) {
        newProducts[index].weight = Number(selectedValue) || 0;
      }
      // Если выбран "Свой вес", оставляем текущий вес и позволяем редактировать вручную
      setFormProducts(newProducts);
    }
  };

  const handleWeightChange = (index: number, weightStr: string) => {
    const newProducts = [...formProducts];
    newProducts[index].weight = parseInt(weightStr, 10) || 0;
    setFormProducts(newProducts);
  };

  const addProductField = () => setFormProducts([...formProducts, { productId: 0, weight: 0 }]);

  // Search and add product logic
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter((p) => p.name.toLowerCase().includes(query));
  }, [allProducts, searchQuery]);

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
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
        document.body.classList.add('dropdown-open');
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.classList.remove('dropdown-open');
      };
    }
  }, [showAddMenu]);

  if (!dish) return null;

  const isBasicInfoOpen = openSections.includes('basic-info');
  const isProductsOpen = openSections.includes('products');
  const isTripsOpen = openSections.includes('trips');

  const editingProduct =
    editingPortionIndex !== null
      ? allProducts.find(
          (p) =>
            p.id ===
            (isEditing
              ? formProducts[editingPortionIndex]?.productId
              : currentProducts[editingPortionIndex]?.productId)
        ) || null
      : null;

  const editingDishProduct =
    editingPortionIndex !== null
      ? isEditing
        ? formProducts[editingPortionIndex] || null
        : currentProducts[editingPortionIndex] || null
      : null;

  return (
    <div className="space-y-6 pl-1" ref={containerRef}>
      <CollapsibleSection
        id="basic-info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={isBasicInfoOpen}
        onToggle={onToggleSection}
        actionButton={
          isEditing ? (
            <div
              className="flex items-center gap-2 min-w-[280px] justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Отмена
              </Button>
              <Button type="button" variant="primary" onClick={validateAndSave} icon={Soup}>
                Сохранить изменения
              </Button>
            </div>
          ) : (
            <Button type="button" variant="primary" onClick={handleStartEdit} icon={Edit}>
              Редактировать
            </Button>
          )
        }
        gradientFrom="from-blue-500/5"
        gradientVia="via-purple-500/5"
        gradientTo="to-pink-500/5"
      >
        <div className="space-y-4 pt-4">
          {isEditing ? (
            <>
              <FormField label="Название блюда" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  placeholder="Например, Плов туристический"
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
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Название блюда
                </label>
                <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground">
                  {dish.name}
                </div>
              </div>

              {dish.description && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                  <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                    {dish.description}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleSection>

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
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHeaderNutrition(!showHeaderNutrition);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all"
            >
              {showHeaderNutrition ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-600" />
                      <span className="font-semibold text-orange-600">
                        {totalNutrition.calories}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1">
                      <Beef className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-blue-600">{totalNutrition.proteins}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplet className="w-3.5 h-3.5 text-yellow-600" />
                      <span className="font-semibold text-yellow-600">{totalNutrition.fats}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wheat className="w-3.5 h-3.5 text-green-600" />
                      <span className="font-semibold text-green-600">{totalNutrition.carbs}</span>
                    </div>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground text-sm">
                      {totalWeight}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
                  <div className="flex items-center gap-1">
                    <Weight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground text-sm">
                      {totalWeight}
                    </span>
                  </div>
                </>
              )}
            </button>
          )
        }
        gradientFrom="from-orange-500/5"
        gradientVia="via-yellow-500/5"
        gradientTo="to-green-500/5"
      >
        <div className="space-y-4 pt-4">
          {isEditing && (
            <div className="relative mb-4" ref={searchInputRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowAddMenu(true)}
                  placeholder="Найти продукт..."
                  className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all"
                />
              </div>

              {showAddMenu && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-[9999]"
                  style={{
                    maxHeight: '320px',
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const scrollContainer = dropdownRef.current?.querySelector(
                      '.absolute-dropdown-scrollbar'
                    ) as HTMLElement;
                    if (scrollContainer) {
                      scrollContainer.scrollTop += e.deltaY;
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
                        <div className="max-h-[280px] overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddProduct(product.id)}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 rounded"
                            >
                              <Component className="w-3.5 h-3.5 text-blue-500" />
                              {product.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {isEditing ? (
              <>
                {formProducts.length > 0 ? (
                  formProducts.map((p, index) => {
                    const selectedProduct = allProducts.find(
                      (prod: Product) => prod.id === p.productId
                    );
                    const portionOptions: Array<{ value: string; label: string }> =
                      selectedProduct?.portions.map((portion) => ({
                        value: String(portion.weight),
                        label: `${portion.name} (${portion.weight} г)`,
                      })) || [];
                    portionOptions.push({ value: CUSTOM_WEIGHT_VALUE, label: 'Свой вес...' });

                    // Определяем текущую порцию: сначала ищем точное совпадение по весу
                    // Если не найдено, проверяем, есть ли такой вес в списке порций
                    const exactMatch = portionOptions.find((opt) => Number(opt.value) === p.weight);
                    const currentPortion = exactMatch || portionOptions[portionOptions.length - 1]; // Последний элемент - это всегда "Свой вес..."

                    return (
                      <div
                        key={index}
                        className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-lg p-3 transition-all duration-200"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Продукт {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteProduct(index)}
                              className="text-muted-foreground hover:text-danger hover:bg-danger/10"
                              disabled={formProducts.length === 1}
                              title="Удалить продукт"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <DropdownSelect
                            label="Продукт"
                            icon={Component}
                            options={productOptions}
                            value={String(p.productId || '')}
                            onChange={(val) =>
                              typeof val === 'string' && handleProductChange(index, val)
                            }
                            placeholder="Выберите продукт..."
                          />

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <DropdownSelect
                                label="Порция"
                                icon={Box}
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
                                icon={Weight}
                              />
                            </FormField>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Soup className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Пусто</p>
                    <p className="text-xs mt-1">Добавьте продукты</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={addProductField}
                  className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добавить продукт
                </Button>
              </>
            ) : (
              <>
                {currentProducts.length > 0 ? (
                  currentProducts.map((dishProduct, index) => {
                    const product = allProducts.find((p) => p.id === dishProduct.productId);
                    if (!product) return null;

                    const canRemove = currentProducts.length > 1;

                    return (
                      <div
                        key={index}
                        className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-lg p-3 transition-all duration-200 hover:shadow-sm"
                      >
                        <ProductContentReadOnly
                          dishProduct={dishProduct}
                          product={product}
                          onEditPortion={() => handleEditPortion(index)}
                          onRemove={() => handleDeleteProduct(index)}
                          onView={() => handleOpenProduct(product.id)}
                          canRemove={canRemove}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Soup className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Пусто</p>
                    <p className="text-xs mt-1">Добавьте продукты</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {tripsUsingDish.length > 0 && (
        <CollapsibleSection
          id="trips"
          title="Походы"
          icon={<MapPin className="w-4 h-4 text-primary" />}
          isOpen={isTripsOpen}
          onToggle={onToggleSection}
          summaryContent={
            tripsUsingDish.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Hash className="w-3.5 h-3.5" />
                {tripsUsingDish.length}
              </span>
            )
          }
          gradientFrom="from-purple-500/5"
          gradientVia="via-pink-500/5"
          gradientTo="to-red-500/5"
        >
          <div className="space-y-4 pt-4">
            <div className="space-y-3">
              {tripsUsingDish.map((trip) => {
                const listItemConfig = tripEntityConfig.views.listItem;

                return (
                  <div
                    key={trip.id}
                    className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 rounded-lg p-3 transition-all duration-200 hover:shadow-sm cursor-pointer"
                    onClick={() => handleViewTrip(trip.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {listItemConfig.icon && (
                          <listItemConfig.icon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        )}
                        <h4 className="font-medium text-foreground truncate hover:text-primary transition-colors">
                          {listItemConfig.title(trip)}
                        </h4>
                      </div>
                    </div>
                    {listItemConfig.details && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        {listItemConfig.details(trip).map((detail, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            {detail.label}: {detail.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CollapsibleSection>
      )}

      <EditPortionModal
        isOpen={editingPortionIndex !== null}
        onClose={handleClosePortionModal}
        onSave={handleSavePortion}
        product={editingProduct}
        dishProduct={editingDishProduct}
      />
    </div>
  );
};

export default DishDetail;
