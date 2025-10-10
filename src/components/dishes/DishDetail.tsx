// src/components/dishes/DishDetail.tsx

import React, { useState } from 'react';
import { Edit, Soup, Flame, Zap, Droplet, Wheat, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dish } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useCategoryStore from '../../stores/useCategoryStore';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';
import EditPortionModal from './EditPortionModal';
import EntityListItem from '../../ui/EntityListItem';
import { tripEntityConfig, productEntityConfig } from '../../config/entityConfig';

interface DishDetailProps {
  dish: Dish | null;
  onEdit: () => void;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
}

const DishDetail: React.FC<DishDetailProps> = ({ dish, onEdit, openSections, onToggleSection }) => {
  const navigate = useNavigate();
  const { products: allProducts } = useProductStore();
  const { categories } = useCategoryStore();
  const { removeProductFromDish, updateProductInDish } = useDishStore();
  const { getTripsUsingDish } = useTripStore();

  const [editingPortionIndex, setEditingPortionIndex] = useState<number | null>(null);

  if (!dish) {
    return null;
  }

  const tripsUsingDish = getTripsUsingDish(dish.id);
  const totalWeight = dish.products.reduce((sum, p) => sum + p.weight, 0);

  const calculateDishNutrition = () => {
    let totalCalories = 0,
      totalProteins = 0,
      totalFats = 0,
      totalCarbs = 0;
    dish.products.forEach((dishProduct) => {
      const product = allProducts.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = dishProduct.weight / 100;
        totalCalories += (product.calories || 0) * weightRatio;
        totalProteins += (product.proteins || 0) * weightRatio;
        totalFats += (product.fats || 0) * weightRatio;
        totalCarbs += (product.carbs || 0) * weightRatio;
      }
    });
    return {
      calories: Math.round(totalCalories),
      proteins: Math.round(totalProteins),
      fats: Math.round(totalFats),
      carbs: Math.round(totalCarbs),
    };
  };

  const nutrition = calculateDishNutrition();

  const handleDeleteProduct = (productIndex: number) => {
    removeProductFromDish(dish.id, productIndex);
  };

  const handleEditPortion = (productIndex: number) => {
    setEditingPortionIndex(productIndex);
  };

  const handleSavePortion = (newWeight: number) => {
    if (editingPortionIndex !== null && dish) {
      updateProductInDish(dish.id, editingPortionIndex, newWeight);
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

  const sections = [
    {
      id: 'main',
      title: 'Основное',
      icon: Flame,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onEdit} title="Редактировать блюдо">
          <Edit className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Общий вес: {totalWeight} г</span>
            <span>•</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1" title="Калорийность">
                <Flame className="w-3 h-3" />
                <span>{nutrition.calories} ккал</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1" title="Белки">
                <Zap className="w-3 h-3" />
                <span>Б:{nutrition.proteins}</span>
              </div>
              <div className="flex items-center gap-1" title="Жиры">
                <Droplet className="w-3 h-3" />
                <span>Ж:{nutrition.fats}</span>
              </div>
              <div className="flex items-center gap-1" title="Углеводы">
                <Wheat className="w-3 h-3" />
                <span>У:{nutrition.carbs}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'products',
      title: 'Состав блюда',
      icon: Soup,
      content: (
        <div className="space-y-3">
          {dish.products.map((p, index) => {
            const product = allProducts.find((ap) => ap.id === p.productId);
            if (!product) return null;

            const category = categories.find((c) => c.id === product.categoryId);
            const listItemConfig = productEntityConfig.views.listItem;
            const allActions = listItemConfig.actions?.({
              onView: () => handleOpenProduct(product.id),
              onEditPortion: () => handleEditPortion(index),
              onRemove: () => handleDeleteProduct(index),
            });

            // Не даем удалить последний продукт
            const actions =
              dish.products.length > 1
                ? allActions
                : allActions?.filter((a: any) => a.label !== 'Удалить продукт из блюда');

            return (
              <EntityListItem
                key={index}
                title={listItemConfig.title(product)}
                icon={productEntityConfig.getIcon(product)}
                borderColor={productEntityConfig.getBorderColor(product, { category })}
                details={listItemConfig.details?.(product, { dishProduct: p })}
                menuItems={actions}
              />
            );
          })}
        </div>
      ),
    },
    {
      id: 'trips',
      title: 'Походы',
      icon: MapPin,
      content: (
        <div className="space-y-2">
          {tripsUsingDish.length > 0 ? (
            tripsUsingDish.map((trip) => {
              const listItemConfig = tripEntityConfig.views.listItem;
              const actions = listItemConfig
                .actions?.({
                  onView: () => handleViewTrip(trip.id),
                })
                .filter((a: any) => a.label === 'Открыть поход');

              return (
                <EntityListItem
                  key={trip.id}
                  title={listItemConfig.title(trip)}
                  icon={tripEntityConfig.getIcon(trip)}
                  borderColor={tripEntityConfig.getBorderColor(trip)}
                  details={listItemConfig.details?.(trip)}
                  menuItems={actions}
                  onClick={() => handleViewTrip(trip.id)}
                />
              );
            })
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">
              Блюдо не используется в походах
            </p>
          )}
        </div>
      ),
    },
  ];

  const editingProduct =
    editingPortionIndex !== null && dish
      ? allProducts.find((p) => p.id === dish.products[editingPortionIndex]?.productId) || null
      : null;

  const editingDishProduct =
    editingPortionIndex !== null && dish ? dish.products[editingPortionIndex] || null : null;

  return (
    <>
      <DetailPane sections={sections} openSections={openSections} onToggleSection={onToggleSection}>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground mb-1">{dish.name}</h2>
        </div>
      </DetailPane>

      <EditPortionModal
        isOpen={editingPortionIndex !== null}
        onClose={handleClosePortionModal}
        onSave={handleSavePortion}
        product={editingProduct}
        dishProduct={editingDishProduct}
      />
    </>
  );
};

export default DishDetail;
