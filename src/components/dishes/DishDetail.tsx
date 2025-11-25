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
  PieChart,
  Circle,
  AlertTriangle,
  Save,
  Copy,
  GripVertical,
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
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import type { Dish, DishData, DishProduct, Product, ProductPortion } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import useCategoryStore from '../../stores/useCategoryStore';
import useTripStore from '../../stores/useTripStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import Button from '../../ui/Button';
import EditPortionModal from './EditPortionModal';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import DropdownSelect from '../../ui/DropdownSelect';
import { toast } from 'react-hot-toast';
import Modal from '../../ui/Modal';
import { tripEntityConfig } from '../../config/entityConfig';

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

// --- CollapsibleSection ---
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
      {isOpen && <div className="p-6 pt-0">{children}</div>}
    </div>
  );
};

// --- Read Only Product View ---
const ProductContentReadOnly: React.FC<{
  dishProduct: DishProduct;
  product: Product;
  onEditPortion: () => void;
  onRemove: () => void;
  onView: () => void;
  canRemove: boolean;
}> = ({ dishProduct, product, onEditPortion, onRemove, onView, canRemove }) => {
  const [showNutrition, setShowNutrition] = useState(!canRemove);

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

  const PortionIcon = portion?.isIndivisible ? Circle : PieChart;

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
          {canRemove && (
            <>
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
            </>
          )}
        </div>
      </div>

      {dishProduct.weight && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 px-3 py-2 text-sm bg-card border border-border rounded-lg">
            <PortionIcon className="w-4 h-4 text-muted-foreground" />
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

// --- Editable nutrition block (matches read-only UI) ---
const EditableProductNutrition: React.FC<{ product: Product | null; weight: number }> = ({
  product,
  weight,
}) => {
  const [show, setShow] = useState(true);

  if (!product || !weight) return null;

  const multiplier = weight / 100;
  const nutrition = {
    calories: Math.round((product.calories || 0) * multiplier),
    proteins: Math.round((product.proteins || 0) * multiplier * 10) / 10,
    fats: Math.round((product.fats || 0) * multiplier * 10) / 10,
    carbs: Math.round((product.carbs || 0) * multiplier * 10) / 10,
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShow(!show);
      }}
      className="flex items-center gap-1.5 h-8 px-2.5 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all text-xs"
      title={`${nutrition.calories} ккал`}
      type="button"
    >
      {show ? (
        <>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 transition-transform" />
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">{nutrition.calories}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1">
            <Beef className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">{nutrition.proteins}</span>
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
            <span className="text-sm font-semibold text-muted-foreground">{weight}</span>
          </div>
        </>
      ) : (
        <>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground rotate-90 transition-transform" />
          <div className="flex items-center gap-1">
            <Weight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">{weight}</span>
          </div>
        </>
      )}
    </button>
  );
};

// --- Sortable Product Item ---
interface SortableProductItemProps {
  product: DishProduct;
  selectedProduct: Product | undefined;
  portionOptions: Array<{
    value: string;
    label: string;
    menuLabel: string;
    icon: React.ComponentType<any>;
  }>;
  currentPortion: any;
  index: number;
  onPortionChange: (index: number, value: string) => void;
  onWeightChange: (index: number, value: string) => void;
  onDelete: (index: number) => void;
}

const SortableProductItem: React.FC<SortableProductItemProps> = ({
  product,
  selectedProduct,
  portionOptions,
  currentPortion,
  index,
  onPortionChange,
  onWeightChange,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: product.productId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted/50 rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="font-medium text-sm flex items-center gap-2">
            <Component className="w-3.5 h-3.5 text-blue-500" />
            {selectedProduct?.name || 'Product not found'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <EditableProductNutrition product={selectedProduct || null} weight={product.weight} />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(index)}
            className="bg-danger/10 hover:bg-danger/20 text-danger"
            title="Удалить продукт"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Порция</label>
          <DropdownSelect
            value={currentPortion?.value || ''}
            onChange={(value) => onPortionChange(index, value)}
            options={portionOptions}
            placeholder="Выберите порцию..."
            icon={currentPortion?.icon || PieChart}
          />
        </div>
        <div className="w-24">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Вес (г)</label>
          <Input
            type="number"
            value={product.weight || ''}
            onChange={(e) => onWeightChange(index, e.target.value)}
            placeholder="Вес"
            className="text-center"
            min="1"
          />
        </div>
      </div>
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
  const { removeProductFromDish, updateProductInDish, updateDish, dishes, addDish } =
    useDishStore();
  const { getTripsUsingDish } = useTripStore();
  const { categories } = useCategoryStore();
  const { searchByCategory } = useSettingsStore();

  const [editingPortionIndex, setEditingPortionIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHeaderNutrition, setShowHeaderNutrition] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const editTriggerRef = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // --- ВОТ ЭТИ СТРОКИ БЫЛИ ПРОПУЩЕНЫ ---
  const isBasicInfoOpen = openSections.includes('basic-info');
  const isProductsOpen = openSections.includes('products');
  const isTripsOpen = openSections.includes('trips');
  // -------------------------------------

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

  // Check if composition changed
  const hasCompositionChanged = useMemo(() => {
    if (!dish) return false;
    if (dish.products.length !== formProducts.length) return true;
    return JSON.stringify(dish.products) !== JSON.stringify(formProducts);
  }, [dish, formProducts]);

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

    // If products changed, show modal choice
    if (hasCompositionChanged) {
      setSaveAsName(`${trimmedName} (копия)`);
      setIsSaveModalOpen(true);
    } else {
      // Only text changed, simple update
      updateDish(dish.id, { name: trimmedName, description, products: validProducts });
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleConfirmSave = (action: 'replace' | 'new') => {
    if (!dish) return;

    const validProducts = formProducts.filter((p) => p.productId > 0 && p.weight > 0);

    if (action === 'replace') {
      updateDish(dish.id, { name, description, products: validProducts });
      toast.success('Блюдо обновлено');
    } else {
      if (!saveAsName.trim()) {
        toast.error('Введите имя для нового блюда');
        return;
      }
      addDish({ name: saveAsName, description, products: validProducts });
      toast.success('Создано новое блюдо');
    }

    setIsSaveModalOpen(false);
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

  const handleProductChange = (index: number, selectedValue: string) => {
    const newProducts = [...formProducts];
    const productId = Number(selectedValue) || 0;
    newProducts[index].productId = productId;
    const product = allProducts.find((p: Product) => p.id === productId);
    newProducts[index].weight = product?.portions?.[0]?.weight || 100;
    setFormProducts(newProducts);
  };

  const handlePortionChange = (index: number, selectedValue: string) => {
    const newProducts = [...formProducts];
    if (selectedValue === CUSTOM_WEIGHT_VALUE) {
      // Logic handled by UI state usually, but here we just keep current weight or set default
      // User will edit weight manually
    } else {
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

  const addProductField = () => setFormProducts([...formProducts, { productId: 0, weight: 0 }]);

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
      {/* Basic Info Section */}
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
              <Button type="button" variant="primary" onClick={handlePreSave} icon={Soup}>
                Сохранить изменения
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
              icon={Edit}
            >
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
          {/* Search for adding products */}
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
                  className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              {showAddMenu && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-1"
                >
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProduct(p.id)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded flex items-center gap-2 text-sm"
                      >
                        <Component className="w-3.5 h-3.5 text-blue-500" /> {p.name}
                      </button>
                    ))
                  )}
                </div>
              )}
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
                    portionOptions.push({
                      value: CUSTOM_WEIGHT_VALUE,
                      label: 'Свой вес...',
                      menuLabel: 'Свой вес...',
                      icon: PieChart,
                    });

                    const currentPortion =
                      portionOptions.find((opt) => Number(opt.value) === p.weight) ||
                      portionOptions[portionOptions.length - 1];

                    return (
                      <SortableProductItem
                        key={p.productId}
                        product={p}
                        selectedProduct={selectedProduct}
                        portionOptions={portionOptions}
                        currentPortion={currentPortion}
                        index={index}
                        onPortionChange={handlePortionChange}
                        onWeightChange={handleWeightChange}
                        onDelete={handleDeleteProduct}
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
                    <div
                      key={index}
                      className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 hover:shadow-sm transition-all"
                    >
                      <ProductContentReadOnly
                        dishProduct={dishProduct}
                        product={product}
                        onEditPortion={() => handleEditPortion(index)}
                        onRemove={() => handleDeleteProduct(index)}
                        onView={() => handleOpenProduct(product.id)}
                        canRemove={isEditing ? currentProducts.length > 1 : false}
                      />
                    </div>
                  );
                })}
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
          gradientFrom="from-purple-500/5"
          gradientVia="via-pink-500/5"
          gradientTo="to-red-500/5"
        >
          <div className="pt-4 space-y-2">
            {tripsUsingDish.map((t) => {
              const listItemConfig = tripEntityConfig.views.listItem;
              return (
                <div
                  key={t.id}
                  className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-purple-500/10"
                  onClick={() => handleViewTrip(t.id)}
                >
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-sm">{listItemConfig.title(t)}</span>
                </div>
              );
            })}
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
