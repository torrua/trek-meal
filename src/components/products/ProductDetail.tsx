// src/components/products/ProductDetail.tsx

import React, { useState, useEffect } from 'react';
import {
  Info,
  Edit,
  BarChart,
  ChevronDown,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Thermometer,
  Check,
  Hash,
  PieChart, // Для делимой порции и заголовка
  Circle, // Для неделимой порции
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
import ProductForm from './ProductForm';
import InfoField from '../../ui/InfoField';
import cn from 'classnames';

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
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border rounded-xl overflow-hidden ${gradientFrom.includes('gradient-') ? gradientFrom : ''}`}
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

// --- Основной компонент ---

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
  editTrigger?: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, editTrigger }) => {
  const { categories } = useCategoryStore();
  const [isEditing, setIsEditing] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition', 'portions']);

  useEffect(() => {
    if (editTrigger && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger]);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  if (!product) return null;

  const category = categories.find((c: Category) => c.id === product.categoryId);

  if (isEditing) {
    return (
      <div className="pl-1">
        <ProductForm product={product} onSubmit={handleSave} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pl-1">
      {/* 1. Основная информация */}
      <CollapsibleSection
        id="info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('info')}
        onToggle={handleToggleSection}
        gradientFrom="gradient-primary"
        gradientVia=""
        gradientTo=""
        actionButton={
          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        }
      >
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Название продукта
            </label>
            <div className="w-full h-10 px-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground font-medium flex items-center">
              {product.name}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Категория</label>
              <div className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm flex items-center gap-2">
                {category ? (
                  <>
                    <span>{category.emoji}</span>
                    <span className="text-foreground">{category.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Без категории</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Особенности</label>
              {product.isPerishable ? (
                <div className="w-full px-4 py-2.5 bg-warning/10 border border-warning/20 rounded-lg text-sm flex items-center gap-2 text-warning-foreground">
                  <Thermometer className="w-4 h-4" />
                  <span>Скоропортящийся</span>
                </div>
              ) : (
                <div className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Длительного хранения</span>
                </div>
              )}
            </div>
          </div>

          {product.description && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
              <div className="flex w-full min-h-[84px] px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap box-border">
                {product.description}
              </div>
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
        gradientFrom="gradient-nutrition"
        gradientVia=""
        gradientTo=""
      >
        <div className="pt-4">
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
            {product.portions.length}
          </span>
        }
      >
        <div className="space-y-3 pt-4">
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

                <span className="text-sm bg-background px-3 py-1 rounded border border-border text-muted-foreground min-w-[4rem] text-center">
                  {portion.weight} г
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground text-sm italic">
              Порции не заданы
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default ProductDetail;
