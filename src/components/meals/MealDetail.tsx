// src/components/meals/MealDetail.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, List, Utensils, Component } from 'lucide-react';
import type { Meal, MealPlanItem } from '../../types';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';
import EntityListItem from '../../ui/EntityListItem';
import useDishStore from '../../stores/useDishStore';
import useProductStore from '../../stores/useProductStore';
import { dishEntityConfig, productEntityConfig } from '../../config/entityConfig';

interface MealDetailProps {
  meal: Meal | null;
  onEdit: () => void;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
}

const MealDetail: React.FC<MealDetailProps> = ({ meal, onEdit, openSections, onToggleSection }) => {
  const navigate = useNavigate();
  const { dishes } = useDishStore();
  const { products } = useProductStore();

  if (!meal) return null;

  const sections = [
    {
      id: 'main',
      title: 'Основное',
      icon: List,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onEdit} title="Редактировать прием пищи">
          <Edit className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-4">
          {meal.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {meal.description}
              </p>
            </div>
          )}
          <div className="text-sm text-muted-foreground">Компонентов: {meal.items.length}</div>
        </div>
      ),
    },
    {
      id: 'items',
      title: 'Состав',
      icon: Utensils,
      content: (
        <div className="space-y-2">
          {meal.items.length > 0 ? (
            meal.items.map((item: MealPlanItem) => {
              if (item.type === 'dish') {
                const dish = dishes.find((d) => d.id === item.itemId);
                if (!dish) return null;
                const listItemConfig = dishEntityConfig.views.listItem;
                return (
                  <EntityListItem
                    key={item.instanceId}
                    title={listItemConfig.title(dish)}
                    icon={dishEntityConfig.getIcon(dish)}
                    borderColor={dishEntityConfig.getBorderColor(dish)}
                    details={listItemConfig.details?.(dish)}
                    menuItems={[
                      {
                        label: 'Открыть блюдо',
                        icon: Component,
                        onClick: () => navigate(`/dishes?selectedId=${dish.id}`),
                      },
                    ]}
                    onClick={() => navigate(`/dishes?selectedId=${dish.id}`)}
                  />
                );
              }
              // product
              const product = products.find((p) => p.id === item.itemId);
              if (!product) return null;
              const listItemConfig = productEntityConfig.views.listItem;
              return (
                <EntityListItem
                  key={item.instanceId}
                  title={product.name}
                  icon={productEntityConfig.getIcon(product)}
                  borderColor={productEntityConfig.getBorderColor(product)}
                  details={listItemConfig.details?.(product)}
                  menuItems={[
                    {
                      label: 'Открыть продукт',
                      icon: Component,
                      onClick: () => navigate(`/products?selectedId=${product.id}`),
                    },
                  ]}
                  onClick={() => navigate(`/products?selectedId=${product.id}`)}
                />
              );
            })
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">Пусто</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailPane sections={sections} openSections={openSections} onToggleSection={onToggleSection}>
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground truncate">{meal.name}</h2>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default MealDetail;
