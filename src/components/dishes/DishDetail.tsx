// src/components/dishes/DishDetail.tsx

import React, { useState } from 'react';
import {
  Edit,
  Soup,
  Package,
  Scale,
  ExternalLink,
  Trash2,
  Flame,
  Zap,
  Droplet,
  Wheat,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dish } from '../../types';
import useProductStore from '../../stores/useProductStore';
import useCategoryStore from '../../stores/useCategoryStore';
import useDishStore from '../../stores/useDishStore';
import useTripStore from '../../stores/useTripStore';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';
import EditPortionModal from './EditPortionModal';
import TripListItem from './TripListItem';

interface DishDetailProps {
  dish: Dish | null;
  onEdit: () => void;
}

const DishDetail: React.FC<DishDetailProps> = ({ dish, onEdit }) => {
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

  // Calculate nutritional values for the dish
  const calculateDishNutrition = () => {
    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbs = 0;

    dish.products.forEach((dishProduct) => {
      const product = allProducts.find((p) => p.id === dishProduct.productId);
      if (product) {
        const weightRatio = dishProduct.weight / 100; // Nutrition values are per 100g
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
    if (dish.products.length === 1) {
      // This check is also in the store, but we show it here for immediate feedback
      return;
    }
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
    // Navigate to products page and select the product by passing selectedId as URL parameter
    navigate(`/products?selectedId=${productId}`);
  };

  const handleViewTrip = (tripId: number) => {
    navigate(`/trips/${tripId}`);
  };

  const sections = [
    {
      id: 'products',
      title: 'Состав блюда',
      icon: Soup,
      content: (
        <div className="space-y-3">
          {dish.products.map((p, index) => {
            const product = allProducts.find((ap) => ap.id === p.productId);
            const category = product ? categories.find((c) => c.id === product.categoryId) : null;
            const borderColor = category ? category.color : '#6b7280';

            return (
              <div
                key={index}
                className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
                style={{ borderLeftColor: borderColor }}
                data-testid={`dish-product-${index}`}
              >
                {/* One-line layout with justify-between */}
                <div className="flex items-center justify-between">
                  {/* Left section: Package • Product Name */}
                  <div className="flex items-center gap-x-1.5 text-sm min-w-0">
                    <div title="Продукт">
                      <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {product?.name || 'Неизвестный продукт'}
                    </h3>
                  </div>

                  {/* Right section: Weight + context menu */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-x-1.5 text-sm">
                      <div
                        className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
                        title="Вес продукта"
                      >
                        <Scale className="w-4 h-4" />
                        <span className="font-medium">{p.weight} г</span>
                      </div>
                    </div>

                    {/* Context menu buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product) {
                            handleOpenProduct(product.id);
                          }
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Открыть продукт"
                        aria-label={`Открыть продукт ${product?.name || ''}`}
                      >
                        <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPortion(index);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        title="Редактировать порцию"
                        aria-label={`Редактировать порцию ${product?.name || ''}`}
                      >
                        <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      {dish.products.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(index);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
                          title="Удалить продукт из блюда"
                          aria-label={`Удалить ${product?.name || 'продукт'} из блюда`}
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
            tripsUsingDish.map((trip) => (
              <TripListItem key={trip.id} trip={trip} onView={() => handleViewTrip(trip.id)} />
            ))
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
      <DetailPane sections={sections} openSections={['products', 'trips']}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-1">{dish.name}</h2>
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
          <Button variant="secondary" onClick={onEdit}>
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Изменить</span>
          </Button>
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
