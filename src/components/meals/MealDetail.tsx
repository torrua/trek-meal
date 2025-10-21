// src/components/meals/MealDetail.tsx

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  List,
  Utensils,
  Component,
  Flame,
  TrendingUp,
  Soup,
  Scale,
  Hash,
} from 'lucide-react';
import type { Meal, MealPlanItem, Product, Dish } from '../../types';
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

// Helper function to calculate nutrition for an item
const calculateItemNutrition = (item: MealPlanItem, products: Product[], dishes: Dish[]) => {
  if (item.type === 'product') {
    const product = products.find((p) => p.id === item.itemId);
    if (!product || !item.weight) return null;

    const multiplier = item.weight / 100;
    return {
      calories: Math.round(product.calories * multiplier),
      proteins: Math.round(product.proteins * multiplier * 10) / 10,
      fats: Math.round(product.fats * multiplier * 10) / 10,
      carbs: Math.round(product.carbs * multiplier * 10) / 10,
      weight: item.weight,
    };
  }

  if (item.type === 'dish') {
    const dish = dishes.find((d) => d.id === item.itemId);
    if (!dish) return null;

    return {
      calories: Math.round(dish.totalCalories),
      proteins: Math.round(dish.totalProteins * 10) / 10,
      fats: Math.round(dish.totalFats * 10) / 10,
      carbs: Math.round(dish.totalCarbs * 10) / 10,
      weight: null,
    };
  }

  return null;
};

const MealDetail: React.FC<MealDetailProps> = ({ meal, onEdit, openSections, onToggleSection }) => {
  const navigate = useNavigate();
  const { dishes } = useDishStore();
  const { products } = useProductStore();

  // Calculate total nutrition
  const totalNutrition = useMemo(() => {
    if (!meal) return null;

    let calories = 0;
    let proteins = 0;
    let fats = 0;
    let carbs = 0;

    meal.items.forEach((item) => {
      const nutrition = calculateItemNutrition(item, products, dishes);
      if (nutrition) {
        calories += nutrition.calories;
        proteins += nutrition.proteins;
        fats += nutrition.fats;
        carbs += nutrition.carbs;
      }
    });

    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
    };
  }, [meal, products, dishes]);

  // Count items by type
  const itemCounts = useMemo(() => {
    if (!meal) return { products: 0, dishes: 0 };

    const counts = { products: 0, dishes: 0 };
    meal.items.forEach((item) => {
      if (item.type === 'product') counts.products++;
      else counts.dishes++;
    });
    return counts;
  }, [meal]);

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
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {meal.description}
              </p>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Всего компонентов</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{meal.items.length}</p>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Component className="w-4 h-4 text-blue-500" />
                <Soup className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {itemCounts.products} продуктов · {itemCounts.dishes} блюд
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'nutrition',
      title: 'Пищевая ценность',
      icon: TrendingUp,
      content: totalNutrition && (
        <div className="space-y-4">
          {/* Total Nutrition Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">{totalNutrition.calories}</p>
              <p className="text-xs text-muted-foreground">ккал</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
              <div className="w-5 h-5 rounded-full bg-blue-500/30 mb-2" />
              <p className="text-2xl font-bold text-blue-600">{totalNutrition.proteins}</p>
              <p className="text-xs text-muted-foreground">г белков</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20">
              <div className="w-5 h-5 rounded-full bg-yellow-500/30 mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{totalNutrition.fats}</p>
              <p className="text-xs text-muted-foreground">г жиров</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
              <div className="w-5 h-5 rounded-full bg-green-500/30 mb-2" />
              <p className="text-2xl font-bold text-green-600">{totalNutrition.carbs}</p>
              <p className="text-xs text-muted-foreground">г углеводов</p>
            </div>
          </div>

          {/* Nutrition Bar Chart */}
          <div className="p-4 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-3">Распределение БЖУ</h4>
            <div className="space-y-3">
              {/* Proteins Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-600 font-medium">Белки</span>
                  <span className="text-muted-foreground">{totalNutrition.proteins}г</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min((totalNutrition.proteins / (totalNutrition.proteins + totalNutrition.fats + totalNutrition.carbs)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Fats Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-yellow-600 font-medium">Жиры</span>
                  <span className="text-muted-foreground">{totalNutrition.fats}г</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${Math.min((totalNutrition.fats / (totalNutrition.proteins + totalNutrition.fats + totalNutrition.carbs)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Carbs Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-600 font-medium">Углеводы</span>
                  <span className="text-muted-foreground">{totalNutrition.carbs}г</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.min((totalNutrition.carbs / (totalNutrition.proteins + totalNutrition.fats + totalNutrition.carbs)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'items',
      title: 'Состав',
      icon: Utensils,
      content: (
        <div className="space-y-3">
          {meal.items.length > 0 ? (
            meal.items.map((item: MealPlanItem) => {
              const nutrition = calculateItemNutrition(item, products, dishes);

              if (item.type === 'dish') {
                const dish = dishes.find((d) => d.id === item.itemId);
                if (!dish) return null;
                const listItemConfig = dishEntityConfig.views.listItem;

                return (
                  <div
                    key={item.instanceId}
                    className="bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                  >
                    <EntityListItem
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

                    {/* Nutrition Info */}
                    {nutrition && (
                      <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-semibold">{nutrition.calories}</span>
                          <span className="text-muted-foreground">ккал</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-semibold">
                            Б: {nutrition.proteins}г
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600 font-semibold">
                            Ж: {nutrition.fats}г
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold">
                            У: {nutrition.carbs}г
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // product
              const product = products.find((p) => p.id === item.itemId);
              if (!product) return null;
              const listItemConfig = productEntityConfig.views.listItem;

              // Find portion name if weight matches
              const portion = product.portions?.find((p) => p.weight === item.weight);

              return (
                <div
                  key={item.instanceId}
                  className="bg-card border border-border rounded-lg p-3 hover:border-primary/50 transition-colors"
                >
                  <EntityListItem
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

                  {/* Weight and Nutrition Info */}
                  <div className="mt-3 pt-3 border-t border-border">
                    {item.weight && (
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {portion ? portion.name : 'Другая порция'}
                        </span>
                        <span className="text-muted-foreground">({item.weight} г)</span>
                      </div>
                    )}

                    {nutrition && (
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 text-orange-600">
                          <Flame className="w-3.5 h-3.5" />
                          <span className="font-semibold">{nutrition.calories}</span>
                          <span className="text-muted-foreground">ккал</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-600 font-semibold">
                            Б: {nutrition.proteins}г
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600 font-semibold">
                            Ж: {nutrition.fats}г
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-semibold">
                            У: {nutrition.carbs}г
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Пусто</p>
              <p className="text-xs mt-1">Добавьте продукты или блюда</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailPane sections={sections} openSections={openSections} onToggleSection={onToggleSection}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground truncate">{meal.name}</h2>
          {totalNutrition && (
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-600">{totalNutrition.calories}</span>
                <span>ккал</span>
              </div>
              <span className="text-muted-foreground/50">·</span>
              <span>{meal.items.length} компонентов</span>
            </div>
          )}
        </div>
        <Button variant="secondary" onClick={onEdit} className="flex-shrink-0">
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default MealDetail;
