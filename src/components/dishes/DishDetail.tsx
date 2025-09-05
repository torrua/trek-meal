// src/components/dishes/DishDetail.tsx

import React from 'react';
import { Edit, Soup } from 'lucide-react'; // <--- ИСПРАВЛЕНИЕ: Убрали Utensils
import type { Dish } from '../../types';
import useProductStore from '../../stores/useProductStore';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';

interface DishDetailProps {
  dish: Dish | null;
  onEdit: () => void;
}

const DishDetail: React.FC<DishDetailProps> = ({ dish, onEdit }) => {
  const { products: allProducts } = useProductStore();

  if (!dish) {
    return null;
  }

  const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);

  const sections = [
    {
      id: 'products',
      title: 'Состав блюда',
      icon: Soup,
      content: (
        <ul className="space-y-2">
          {dish.products.map((p, index) => {
            const product = allProducts.find((ap) => ap.id === p.productId);
            return (
              <li key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span className="font-medium text-foreground">
                  {product?.name || 'Неизвестный продукт'}
                </span>
                <span className="font-semibold text-foreground">{p.weight} г</span>
              </li>
            );
          })}
        </ul>
      ),
    },
  ];

  return (
    // <--- ИСПРАВЛЕНИЕ: Убрали onToggleSection
    <DetailPane sections={sections} openSections={['products']}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">{dish.name}</h2>
          <p className="text-muted-foreground">Общий вес: {totalWeight} г</p>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default DishDetail;
