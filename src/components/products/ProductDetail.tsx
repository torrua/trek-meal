// src/components/products/ProductDetail.tsx

import React, { useState } from 'react';
import { Package, Thermometer, Info, Edit, BarChart, Scale } from 'lucide-react';
import type { Product, Category, ProductPortion } from '../../types';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
import ProductForm from './ProductForm';
import DetailPane from '../../ui/DetailPane'; // Используем DetailPane
import InfoField from '../../ui/InfoField';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
  editTrigger?: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit, editTrigger }) => {
  const { categories } = useCategoryStore();
  const [isEditing, setIsEditing] = useState(false);

  // Состояние для раскрытых секций
  const [openSections, setOpenSections] = useState<string[]>(['info', 'nutrition', 'portions']);

  React.useEffect(() => {
    if (editTrigger && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger]);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  if (!product) return null;

  const category = categories.find((c: Category) => c.id === product.categoryId);

  if (isEditing) {
    return (
      <div className="pl-1">
        <ProductForm
          product={product}
          onSubmit={() => {
            setIsEditing(false);
            onEdit();
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  // Конфигурация секций
  const sections = [
    {
      id: 'info',
      title: 'Основная информация',
      icon: Info,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField
              icon={Package}
              label="Категория"
              value={
                category ? (
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </div>
                ) : (
                  'Без категории'
                )
              }
            />
            {product.isPerishable && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <Thermometer className="w-5 h-5 text-warning" />
                <span className="text-sm text-warning-foreground font-medium">Скоропортящийся</span>
              </div>
            )}
          </div>
          {product.description && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Описание
              </span>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Пищевая ценность (на 100г)',
      icon: BarChart,
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Калории',
              val: product.calories,
              color: 'text-orange-600',
              bg: 'bg-orange-50 dark:bg-orange-900/10',
            },
            {
              label: 'Белки',
              val: product.proteins,
              unit: 'г',
              color: 'text-blue-600',
              bg: 'bg-blue-50 dark:bg-blue-900/10',
            },
            {
              label: 'Жиры',
              val: product.fats,
              unit: 'г',
              color: 'text-yellow-600',
              bg: 'bg-yellow-50 dark:bg-yellow-900/10',
            },
            {
              label: 'Углеводы',
              val: product.carbs,
              unit: 'г',
              color: 'text-green-600',
              bg: 'bg-green-50 dark:bg-green-900/10',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3 rounded-xl border border-border/50 text-center ${item.bg}`}
            >
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className={`text-lg font-bold ${item.color}`}>
                {item.val}
                {item.unit}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'portions',
      title: `Порции (${product.portions.length})`,
      icon: Scale,
      content: (
        <div className="space-y-2">
          {product.portions.map((portion: ProductPortion, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{portion.name}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                {portion.weight} г
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full pl-1">
      <DetailPane
        sections={sections}
        openSections={openSections}
        onToggleSection={handleToggleSection}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">{product.name}</h2>
            <p className="text-muted-foreground mt-1">{product.calories} ккал / 100г</p>
          </div>
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Изменить</span>
          </Button>
        </div>
      </DetailPane>
    </div>
  );
};

export default ProductDetail;
