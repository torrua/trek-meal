// src/pages/DishesPage.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CirclePlus, Soup } from 'lucide-react';
import useDishStore from '../stores/useDishStore';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import type { Dish, DishData, SubmitDishAction } from '../types';
import EntityCard from '../ui/EntityCard';
import DishDetail from '../components/dishes/DishDetail';
// Editing moved to dedicated page
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { dishEntityConfig } from '../config/entityConfig';

const DishesPage: React.FC = () => {
  const navigate = useNavigate();
  const { dishes, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { products: allProducts } = useProductStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  // Editing handled via DishDetailPage routes
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  const filteredDishes = useMemo(() => {
    return dishes
      .filter(
        (dish) =>
          !searchTerm.trim() || dish.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dishes, searchTerm]);

  const selectedDish = useMemo(
    () => dishes.find((d) => d.id === activeId) || null,
    [activeId, dishes]
  );

  const handleAddNew = useCallback(() => {
    navigate('/dishes/new');
  }, [navigate]);

  const handleEdit = useCallback(
    (dish: Dish) => {
      navigate(`/dishes/${dish.id}/edit`);
    },
    [navigate]
  );

  const handleRequestDelete = useCallback(
    (dish: Dish) => {
      if (isDishInUse(dish.id)) {
        toast.error('Это блюдо используется в походах. Сначала удалите его из раскладок.', {
          duration: 5000,
        });
      } else {
        setDishToDelete(dish);
      }
    },
    [isDishInUse]
  );

  const handleConfirmDelete = () => {
    if (dishToDelete) {
      if (dishToDelete.id === activeId) setActiveId(null);
      deleteDish(dishToDelete.id);
      setDishToDelete(null);
    }
  };

  // Form submission handled in DishDetailPage

  // Helper function to calculate dish nutrition for the card
  const calculateDishNutrition = (dish: Dish) => {
    const nutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 }; // ИСПРАВЛЕНИЕ: let -> const
    let totalWeight = 0;
    dish.products.forEach((dishProduct) => {
      const product = allProducts.find((p) => p.id === dishProduct.productId);
      if (product) {
        const ratio = dishProduct.weight / 100;
        nutrition.calories += (product.calories || 0) * ratio;
        nutrition.proteins += (product.proteins || 0) * ratio;
        nutrition.fats += (product.fats || 0) * ratio;
        nutrition.carbs += (product.carbs || 0) * ratio;
        totalWeight += dishProduct.weight;
      }
    });
    return {
      nutrition: {
        calories: Math.round(nutrition.calories),
        proteins: Math.round(nutrition.proteins),
        fats: Math.round(nutrition.fats),
        carbs: Math.round(nutrition.carbs),
      },
      totalWeight,
    };
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Блюда</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="primary" onClick={handleAddNew}>
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить блюдо</span>
            </Button>
          </div>
        </div>
      </div>

      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3">
            {filteredDishes.map((dish) => {
              const { nutrition, totalWeight } = calculateDishNutrition(dish);
              const cardConfig = dishEntityConfig.views.card;
              const actions = dishEntityConfig.getActions({
                onEdit: () => handleEdit(dish),
                onDelete: () => handleRequestDelete(dish),
              });

              return (
                <EntityCard
                  key={dish.id}
                  title={cardConfig.title(dish)}
                  subtitle={cardConfig.subtitle?.(dish, { totalWeight })}
                  icon={dishEntityConfig.getIcon(dish)}
                  iconColor={dishEntityConfig.getIconColor?.(dish)}
                  details={cardConfig
                    .details(dish, { nutrition, totalWeight })
                    .map((detail, index) => ({
                      ...detail,
                      key: `dish-detail-${index}`,
                    }))}
                  isSelected={activeId === dish.id}
                  onSelect={() => setActiveId(dish.id)}
                  borderColor={dishEntityConfig.getBorderColor(dish)}
                  menuItems={actions}
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
            {selectedDish ? (
              <DishDetail
                dish={selectedDish}
                onEdit={() => selectedDish && handleEdit(selectedDish)}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Soup className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите блюдо</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра состава.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Soup className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm ? 'Блюда не найдены' : 'Блюд пока нет'}
          </h3>
          {!searchTerm && (
            <Button onClick={handleAddNew} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Создать первое блюдо
            </Button>
          )}
        </div>
      )}

      {/* Editing handled via DishDetailPage routes */}

      <ConfirmModal
        isOpen={!!dishToDelete}
        onClose={() => setDishToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить блюдо{' '}
          <span className="font-bold">{dishToDelete?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default DishesPage;
