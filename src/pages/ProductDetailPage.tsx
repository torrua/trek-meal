// src/components/products/ProductDetail.tsx

import React, { useState } from 'react';
import {
  Package,
  Thermometer,
  Flame,
  Info,
  Edit,
  Beef, // Using Beef instead of Zap
  Droplet,
  Wheat,
  BarChart,
  Scale,
} from 'lucide-react';
import type { Product, Category, ProductPortion } from '../types';
import useCategoryStore from '../stores/useCategoryStore';
import Button from '../ui/Button';
import ProductForm from '../components/products/ProductForm';
import ContentBlock from '../ui/ContentBlock';

interface ProductDetailProps {
  product: Product | null;
  onEdit: () => void;
  editTrigger?: number;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onEdit, editTrigger }) => {
  const { categories } = useCategoryStore();
  const [isEditing, setIsEditing] = useState(false);

  React.useEffect(() => {
    if (editTrigger && editTrigger > 0) {
      setIsEditing(true);
    }
  }, [editTrigger]);

  if (!product) {
    return null;
  }

  const handleSubmit = () => {
    setIsEditing(false);
    onEdit();
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
    <div className="space-y-6 pl-1 pb-10">
      <ContentBlock
        title="Основная информация"
        icon={Info}
        variant="blue"
        actionButton={
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Название
            </label>
            <div className="text-lg font-medium text-foreground">{product.name}</div>
          </div>

          {category && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Категория
              </label>
              <div className="flex items-center gap-2 text-foreground">
                <span>{category.emoji}</span>
                <span>{category.name}</span>
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Описание
              </label>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {product.isPerishable && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg mt-2">
              <Thermometer className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning-foreground font-medium">
                Скоропортящийся продукт
              </span>
            </div>
          )}
        </div>
      </ContentBlock>

      <ContentBlock title="Пищевая ценность (на 100г)" icon={BarChart} variant="orange">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-border/50 text-center">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">Калории</div>
            <div className="text-xl font-bold text-orange-600">{product.calories}</div>
          </div>

          <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-border/50 text-center">
            <Beef className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">Белки</div>
            <div className="text-xl font-bold text-blue-600">{product.proteins} г</div>
          </div>

          <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-border/50 text-center">
            <Droplet className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">Жиры</div>
            <div className="text-xl font-bold text-yellow-600">{product.fats} г</div>
          </div>

          <div className="p-4 bg-white/60 dark:bg-black/20 rounded-lg border border-border/50 text-center">
            <Wheat className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <div className="text-xs text-muted-foreground mb-1">Углеводы</div>
            <div className="text-xl font-bold text-green-600">{product.carbs} г</div>
          </div>
        </div>
      </ContentBlock>

      <ContentBlock title="Порции" icon={Package} variant="purple">
        <div className="space-y-2">
          {product.portions.map((portion: ProductPortion, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{portion.name}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                {portion.weight} г
              </span>
            </div>
          ))}
        </div>
      </ContentBlock>
    </div>
  );
};

export default ProductDetail;
