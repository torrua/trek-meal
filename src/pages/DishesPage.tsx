// src/pages/DishesPage.tsx

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CirclePlus,
  Soup,
  Filter,
  Trash2,
  Copy,
  Share,
  X,
  Check,
  CheckCheck,
  LayoutList,
  Grid3X3,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';
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
import { useViewMode } from '../hooks/useViewMode';
import { exportDishToJson, exportBulkDishesToJson, importDataFromJson } from '../utils/backup';

const DishesPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dishes, deleteDish } = useDishStore();
  const { isDishInUse } = useTripStore();
  const { products: allProducts } = useProductStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  // Editing handled via DishDetailPage routes
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['main', 'products', 'trips']);

  // Multi-selection state
  const [selectedDishIds, setSelectedDishIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  // Add state for bulk delete confirmation
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // View mode state
  const { viewMode, toggleViewMode } = useViewMode('dishes');

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

  // Multi-selection handlers
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

  // Exit multi-select mode completely
  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedDishIds([]);
  };

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedDishIds.length === 0) return;
    // Show confirmation modal
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    // Delete all selected dishes directly using the store function
    selectedDishIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteDish(id);
    });
    // Exit multi-select mode
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedDishIds.length === 0) return;

    console.log(`Cloning dishes: ${selectedDishIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedDishIds.length === 0) return;

    // Get selected dishes and export them
    const selectedDishes = filteredDishes.filter((d) => selectedDishIds.includes(d.id));
    exportBulkDishesToJson(selectedDishes);
  };

  // Import functionality
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Individual dish actions
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
      {/* Header and buttons */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Блюда
          </h1>
          <div className="flex items-center gap-2">
            {!showMultiSelect ? (
              <>
                <Button
                  onClick={() => setOpenSections((s) => (s.length ? [] : ['main', 'products']))}
                  variant="secondary"
                  size="icon"
                  title="Фильтры"
                  aria-label="Показать фильтры"
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
                  <UploadCloud className="w-4 h-4" />
                </Button>

                {/* View mode toggle button */}
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
                  <Check className="w-4 h-4" />
                </Button>
                <Button onClick={handleAddNew} variant="primary" size="default">
                  <CirclePlus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Добавить блюдо</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-10">
                  <span>{selectedDishIds.length}</span>
                  <span className="text-primary/70">из {filteredDishes.length} выделено</span>
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
                    <Share className="w-4 h-4" />
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
          <div className="lg:col-span-1 space-y-3">
            {filteredDishes.map((dish) => {
              const { nutrition, totalWeight } = calculateDishNutrition(dish);
              const cardConfig = dishEntityConfig.views.card;
              const actions = dishEntityConfig.getActions({
                onEdit: () => handleEdit(dish),
                onClone: () => handleClone(dish),
                onExport: () => handleExport(dish),
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
                  isMultiSelected={selectedDishIds.includes(dish.id)}
                  onSelect={() => setActiveId(dish.id)}
                  onMultiSelect={() => toggleDishSelection(dish.id)}
                  borderColor={dishEntityConfig.getBorderColor(dish)}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
            {selectedDish ? (
              <DishDetail
                dish={selectedDish}
                onEdit={() => selectedDish && handleEdit(selectedDish)}
                openSections={openSections}
                onToggleSection={handleToggleSection}
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

      {/* Bulk delete confirmation */}
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
