// src/pages/DishesPage.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Soup,
  Filter,
  Trash2,
  Copy,
  Download,
  Upload,
  X,
  CheckSquare,
  CheckCheck,
  LayoutList,
  Grid3X3,
  Flame,
  Droplet,
  Wheat,
  Weight,
  Beef,
  Hash,
} from 'lucide-react';
import useDishStore from '../stores/useDishStore';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import type { Dish } from '../types';
import EntityCard from '../ui/EntityCard';
import EntityListItem, { MetaItem } from '../ui/EntityListItem';
import DishDetail from '../components/dishes/DishDetail';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { toast } from 'react-hot-toast';
import { dishEntityConfig } from '../config/entityConfig';
import { useViewMode } from '../hooks/useViewMode';
import { exportDishToJson, exportBulkDishesToJson, importDataFromJson } from '../utils/backup';

const DishesPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dishes, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { products: allProducts } = useProductStore();
  const { searchTerm } = useSearchStore();
  const { viewMode, toggleViewMode } = useViewMode('dishes');
  const getVisibleFields = useSettingsStore((state) => state.getVisibleFields);
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailEditTrigger, setDetailEditTrigger] = useState(0);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['basic-info', 'products']);
  const [_editSubmitTrigger, _setEditSubmitTrigger] = useState(0);
  const [_editCancelTrigger, _setEditCancelTrigger] = useState(0);

  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const visibleFields = getVisibleFields('dishes');

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId && dishes.some((d) => d.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });

      // Прокрутка к карточке блюда
      setTimeout(() => {
        const element = document.querySelector(`[data-dish-id="${selectedId}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }
      }, 100);
    }
  }, [searchParams, dishes, setSearchParams]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

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

  const handleEdit = useCallback((dish: Dish) => {
    setActiveId(dish.id);
    setIsDetailEditing(true);
    setOpenSections((prev) => (prev.includes('basic-info') ? prev : [...prev, 'basic-info']));
    setDetailEditTrigger((t) => t + 1);
  }, []);

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
      if (dishToDelete.id === activeId) {
        setActiveId(null);
        setIsDetailEditing(false);
      }
      deleteDish(dishToDelete.id);
      setDishToDelete(null);
    }
  };

  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedDishIds([]);
    }
  };

  const toggleDishSelection = (dishId: number) => {
    setSelectedDishIds((prev: number[]) =>
      prev.includes(dishId) ? prev.filter((id: number) => id !== dishId) : [...prev, dishId]
    );
  };

  const selectAllDishes = () => {
    setSelectedDishIds(filteredDishes.map((dish: Dish) => dish.id));
  };

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedDishIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedDishIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedDishIds.forEach((id) => {
      if (id === activeId) {
        setActiveId(null);
        setIsDetailEditing(false);
      }
      deleteDish(id);
    });
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedDishIds.length === 0) return;
    console.log(`Cloning dishes: ${selectedDishIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedDishIds.length === 0) return;
    const selectedDishes = filteredDishes.filter((d) => selectedDishIds.includes(d.id));
    exportBulkDishesToJson(selectedDishes);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClone = useCallback((dish: Dish) => {
    const { cloneDish } = useDishStore.getState();
    cloneDish(dish.id);
  }, []);

  const handleExport = useCallback((dish: Dish) => {
    try {
      exportDishToJson(dish);
      toast.success('Блюдо экспортировано');
    } catch (error) {
      toast.error('Ошибка при экспорте');
      console.error('Export error:', error);
    }
  }, []);

  const calculateDishNutrition = (dish: Dish) => {
    const nutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
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
        proteins: Math.round(nutrition.proteins * 10) / 10,
        fats: Math.round(nutrition.fats * 10) / 10,
        carbs: Math.round(nutrition.carbs * 10) / 10,
      },
      totalWeight,
    };
  };

  return (
    <div className="max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="mb-6 sm:mb-8 px-4 sm:px-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Блюда
          </h1>
          <div className="flex items-center gap-2 min-w-[320px] justify-end">
            {!showMultiSelect ? (
              <>
                <Button
                  onClick={() =>
                    setOpenSections((s) => (s.length ? [] : ['basic-info', 'products']))
                  }
                  variant="secondary"
                  size="icon"
                  title="Развернуть/Свернуть все"
                  aria-label="Развернуть/Свернуть все"
                >
                  <Filter className="w-4 h-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Импорт"
                  aria-label="Импорт"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  onClick={toggleViewMode}
                  variant="secondary"
                  size="icon"
                  title={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                  aria-label={viewMode === 'default' ? 'Компактный вид' : 'Полный вид'}
                >
                  {viewMode === 'default' ? (
                    <LayoutList className="w-4 h-4" />
                  ) : (
                    <Grid3X3 className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  onClick={toggleMultiSelect}
                  variant="secondary"
                  size="icon"
                  title="Выделить"
                  aria-label="Выделить"
                >
                  <CheckSquare className="w-4 h-4" />
                </Button>

                <Button
                  onClick={handleAddNew}
                  variant="primary"
                  size="default"
                  disabled={isDetailEditing}
                >
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить блюдо</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 h-9 min-w-[320px] justify-end">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                  <span>{`${selectedDishIds.length} из ${filteredDishes.length} выделено`}</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllDishes}
                  disabled={selectedDishIds.length === filteredDishes.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedDishIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedDishIds.length === 0}
                    title="Экспорт"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedDishIds.length === 0}
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Button onClick={exitMultiSelectMode} variant="ghost" size="icon" title="Закрыть">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-12rem)]">
            {filteredDishes.map((dish) => {
              const { nutrition, totalWeight } = calculateDishNutrition(dish);
              const cardConfig = dishEntityConfig.views.card;
              const actions = dishEntityConfig
                .getActions({
                  onEdit: () => handleEdit(dish),
                  onClone: () => handleClone(dish),
                  onExport: () => handleExport(dish),
                  onDelete: () => handleRequestDelete(dish),
                })
                .map((action) => ({
                  ...action,
                  disabled: isDetailEditing && dish.id !== activeId,
                  onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isDetailEditing && dish.id !== activeId) return;
                    if (action.label === 'Редактировать') {
                      handleEdit(dish);
                    } else if (action.label === 'Удалить') {
                      handleRequestDelete(dish);
                    } else if (action.label === 'Клонировать') {
                      handleClone(dish);
                    } else if (action.label === 'Экспорт') {
                      handleExport(dish);
                    }
                  },
                }));

              const isCardDisabled = isDetailEditing && dish.id !== activeId;

              const metaMap: Record<string, MetaItem> = {
                calories: {
                  icon: Flame,
                  text: Math.round(nutrition.calories),
                  className: 'text-orange-600',
                  tooltip: 'Ккал',
                },
                items: {
                  icon: Hash,
                  text: dish.products.length,
                  className: 'text-foreground',
                  tooltip: 'Продуктов',
                },
                proteins: {
                  icon: Beef,
                  text: nutrition.proteins,
                  className: 'text-blue-600',
                  tooltip: 'Белки',
                },
                fats: {
                  icon: Droplet,
                  text: nutrition.fats,
                  className: 'text-yellow-600',
                  tooltip: 'Жиры',
                },
                carbs: {
                  icon: Wheat,
                  text: nutrition.carbs,
                  className: 'text-green-600',
                  tooltip: 'Углеводы',
                },
                weight: {
                  icon: Weight,
                  text: Math.round(totalWeight),
                  className: 'text-foreground',
                  tooltip: 'Вес',
                },
              };

              const metaItems = visibleFields.map((id) => metaMap[id]).filter(Boolean);

              return viewMode === 'compact' ? (
                <div data-dish-id={dish.id}>
                  <EntityListItem
                    key={dish.id}
                    title={cardConfig.title(dish)}
                    meta={metaItems}
                    borderColor={dishEntityConfig.getBorderColor(dish)}
                    isSelected={activeId === dish.id}
                    isMultiSelected={selectedDishIds.includes(dish.id)}
                    onSelect={isCardDisabled ? undefined : () => setActiveId(dish.id)}
                    onMultiSelect={isCardDisabled ? undefined : () => toggleDishSelection(dish.id)}
                    onRequestMultiSelectMode={() => {
                      if (!showMultiSelect) {
                        setShowMultiSelect(true);
                        setSelectedDishIds([dish.id]);
                      }
                    }}
                    menuItems={actions}
                    showMultiSelect={showMultiSelect}
                    variant="meal"
                  />
                </div>
              ) : (
                <div data-dish-id={dish.id}>
                  <EntityCard
                    key={dish.id}
                    title={cardConfig.title(dish)}
                    subtitle={cardConfig.subtitle?.(dish, { totalWeight })}
                    icon={dishEntityConfig.getIcon(dish)}
                    iconColor={dishEntityConfig.getIconColor?.(dish)}
                    details={[]}
                    variant="dish"
                    nutrition={{
                      calories: Math.round(nutrition.calories),
                      proteins: Math.round(nutrition.proteins * 10) / 10,
                      fats: Math.round(nutrition.fats * 10) / 10,
                      carbs: Math.round(nutrition.carbs * 10) / 10,
                      weight: Math.round(totalWeight),
                      itemsCount: dish.products.length,
                    }}
                    isSelected={activeId === dish.id}
                    isMultiSelected={selectedDishIds.includes(dish.id)}
                    onSelect={isCardDisabled ? undefined : () => setActiveId(dish.id)}
                    onMultiSelect={isCardDisabled ? undefined : () => toggleDishSelection(dish.id)}
                    borderColor={dishEntityConfig.getBorderColor(dish)}
                    menuItems={actions}
                    showMultiSelect={showMultiSelect}
                  />
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar">
            {selectedDish ? (
              <DishDetail
                dish={selectedDish}
                onEdit={() => selectedDish && handleEdit(selectedDish)}
                editTrigger={detailEditTrigger}
                openSections={openSections}
                onToggleSection={handleToggleSection}
                onStartEdit={() => setIsDetailEditing(true)}
                onFinishEdit={() => setIsDetailEditing(false)}
                editSubmitTrigger={_editSubmitTrigger}
                editCancelTrigger={_editCancelTrigger}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
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

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Подтверждение"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить {selectedDishIds.length} блюд?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о блюдах будут потеряны.
          </span>
        </p>
      </ConfirmModal>
    </div>
  );
};

export default DishesPage;
