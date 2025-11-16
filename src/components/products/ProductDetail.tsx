// src/components/products/ProductDetail.tsx

import React, { useState, useMemo } from 'react';
import {
  Package,
  Thermometer,
  Flame,
  Tag,
  Info,
  Edit,
  Zap,
  Droplet,
  Wheat,
  BarChart,
  Component,
  ChevronDown,
  Scale,
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
import ProductForm from './ProductForm';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
  editTrigger?: number;
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  actionButton?: React.ReactNode;
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
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border rounded-xl overflow-hidden`}
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

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit, editTrigger }) => {
  const { categories } = useCategoryStore();
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition', 'portions']);
  const [isEditing, setIsEditing] = useState(false);

  // Watch for edit trigger from parent
  React.useEffect(() => {
    if (editTrigger && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger]);

  if (!product) {
    return null;
  }

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    if (!openSections.includes('info')) {
      setOpenSections((prev) => [...prev, 'info']);
    }
  };

  const handleSubmit = (data: any) => {
    // This will be handled by parent through the store
    setIsEditing(false);
    onEdit(); // Trigger parent to handle update
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const category = categories.find((c: Category) => c.id === product.categoryId);

  if (isEditing) {
    return (
      <div className="pl-1">
        <ProductForm product={product} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-1">
      <CollapsibleSection
        id="info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('info')}
        onToggle={handleToggleSection}
        actionButton={
          <Button type="button" variant="primary" onClick={handleStartEdit} icon={Edit}>
            Редактировать
          </Button>
        }
        gradientFrom="from-blue-500/5"
        gradientVia="via-purple-500/5"
        gradientTo="to-pink-500/5"
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Название продукта
            </label>
            <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground">
              {product.name}
            </div>
          </div>

          {category && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Категория</label>
              <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground">
                {category.emoji} {category.name}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
              <div className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap">
                {product.description}
              </div>
            </div>
          )}

          {product.isPerishable && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <Thermometer className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning-foreground">Скоропортящийся продукт</span>
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="nutrition"
        title="Пищевая ценность (на 100г)"
        icon={<BarChart className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('nutrition')}
        onToggle={handleToggleSection}
        gradientFrom="from-orange-500/5"
        gradientVia="via-yellow-500/5"
        gradientTo="to-green-500/5"
      >
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-foreground">Калории</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{product.calories}</p>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-foreground">Белки</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{product.proteins} г</p>
          </div>

          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Droplet className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-foreground">Жиры</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{product.fats} г</p>
          </div>

          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Wheat className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-foreground">Углеводы</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{product.carbs} г</p>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        id="portions"
        title="Порции"
        icon={<Package className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('portions')}
        onToggle={handleToggleSection}
        gradientFrom="from-purple-500/5"
        gradientVia="via-pink-500/5"
        gradientTo="to-blue-500/5"
      >
        <div className="space-y-2 pt-4">
          {product.portions.map((portion: ProductPortion, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{portion.name}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">
                {portion.weight} г
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ProductDetail;
