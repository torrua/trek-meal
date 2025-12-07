// src/pages/ProductsPage.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CirclePlus,
  Filter,
  Download,
  Component,
  Trash2,
  Copy,
  Upload,
  X,
  CheckSquare,
  CheckCheck,
  LayoutList,
  Grid3X3,
  Flame,
  Beef,
  Droplet,
  Wheat,
  PieChart, // Заменили Box на PieChart
} from 'lucide-react';
import { useViewMode } from '../hooks/useViewMode';
import { toast } from 'react-hot-toast';
import useProductStore from '../stores/useProductStore';
import useCategoryStore from '../stores/useCategoryStore';
import useSearchStore from '../stores/useSearchStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import type { Product, ImportedJsonData, Category, ProductData } from '../types';
import EntityCard from '../ui/EntityCard';
import EntityListItem, { MetaItem } from '../ui/EntityListItem';
import ProductDetail from '../components/products/ProductDetail';
import ProductForm from '../components/products/ProductForm';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import ImportProductsModal from '../components/products/ImportProductsModal';
import ProductFiltersComponent, {
  ProductFilters,
} from '../components/products/ProductFiltersComponent';
import { productEntityConfig } from '../config/entityConfig';
import { exportProductToJson, exportBulkProductsToJson } from '../utils/backup';

const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct: _updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const getVisibleFields = useSettingsStore((state) => state.getVisibleFields);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [detailEditTrigger, setDetailEditTrigger] = useState(0);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<ImportedJsonData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<ProductFilters>({ categoryIds: [] });

  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [showMultiSelect, setShowMultiSelect] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const { viewMode, toggleViewMode } = useViewMode('products');
  const visibleFields = getVisibleFields('products');

  useEffect(() => {
    const selectedId = searchParams.get('selectedId');
    if (selectedId && products.some((p) => p.id === Number(selectedId))) {
      setActiveId(Number(selectedId));
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, products, setSearchParams]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const categoryMatch =
          filters.categoryIds.length === 0 ||
          (p.categoryId && filters.categoryIds.includes(String(p.categoryId)));

        const searchMatch =
          !searchTerm.trim() ||
          p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.trim().toLowerCase());

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm, filters]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === activeId) || null,
    [activeId, products]
  );

  const handleAddNew = useCallback(() => {
    setCreatingProduct(true);
    setActiveId(null);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setActiveId(product.id);
    setDetailEditTrigger((prev) => prev + 1);
  }, []);

  const handleInlineCreate = useCallback(
    (formData: ProductData) => {
      addProduct(formData);
      setCreatingProduct(false);
    },
    [addProduct]
  );

  const handleRequestDelete = useCallback((product: Product) => {
    setProductToDelete(product);
  }, []);

  const handleConfirmDelete = () => {
    if (productToDelete) {
      if (productToDelete.id === activeId) setActiveId(null);
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          setFileContent(content);
          setImportModalOpen(true);
        } catch (error) {
          toast.error('Ошибка парсинга JSON. Проверьте формат файла.');
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasActiveFilters = useMemo(() => filters.categoryIds.length > 0, [filters]);

  const toggleMultiSelect = () => {
    setShowMultiSelect(!showMultiSelect);
    if (showMultiSelect) {
      setSelectedProductIds([]);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProductIds(filteredProducts.map((product: Product) => product.id));
  };

  const exitMultiSelectMode = () => {
    setShowMultiSelect(false);
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedProductIds.forEach((id) => {
      if (id === activeId) setActiveId(null);
      deleteProduct(id);
    });
    exitMultiSelectMode();
    setShowBulkDeleteConfirm(false);
  };

  const handleBulkClone = () => {
    if (selectedProductIds.length === 0) return;
    console.log(`Cloning products: ${selectedProductIds.join(', ')}`);
  };

  const handleBulkExport = () => {
    if (selectedProductIds.length === 0) return;
    const selectedProducts = filteredProducts.filter((p) => selectedProductIds.includes(p.id));
    exportBulkProductsToJson(selectedProducts);
  };

  const handleClone = useCallback((product: Product) => {
    const { cloneProduct } = useProductStore.getState();
    cloneProduct(product.id);
  }, []);

  const handleExport = useCallback((product: Product) => {
    try {
      exportProductToJson(product);
      toast.success('Продукт экспортирован');
    } catch (error) {
      toast.error('Ошибка при экспорте');
      console.error('Export error:', error);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Продукты
          </h1>
          <div className="flex items-center gap-2 min-w-[320px] justify-end">
            {!showMultiSelect ? (
              <>
                <Button
                  onClick={() => setShowFilters((s) => !s)}
                  variant="secondary"
                  size="icon"
                  className="relative"
                  title="Фильтры"
                  aria-label="Показать фильтры"
                >
                  <Filter className="w-4 h-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
                  )}
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
                <Button onClick={handleAddNew} variant="primary" size="icon">
                  <CirclePlus className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 h-9 min-w-[320px] justify-end">
                <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm font-medium flex items-center">
                  <span>{`${selectedProductIds.length} из ${filteredProducts.length} выделено`}</span>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={selectAllProducts}
                  disabled={selectedProductIds.length === filteredProducts.length}
                  title="Выделить все"
                >
                  <CheckCheck className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkClone}
                    disabled={selectedProductIds.length === 0}
                    title="Клонировать"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleBulkExport}
                    disabled={selectedProductIds.length === 0}
                    title="Экспорт"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={handleBulkDelete}
                    disabled={selectedProductIds.length === 0}
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

      {showFilters && (
        <div className="mb-6 sm:mb-8 bg-card rounded-xl border border-border notion-shadow-xs p-4 sm:p-5">
          <ProductFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      {filteredProducts.length > 0 || creatingProduct ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-1 space-y-3 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar pl-1 pb-4 pt-2">
            {filteredProducts.map((product) => {
              const category = categories.find((c: Category) => c.id === product.categoryId);
              const cardConfig = productEntityConfig.views.card;
              const actions = productEntityConfig.getActions({
                onEdit: () => handleEdit(product),
                onClone: () => handleClone(product),
                onExport: () => handleExport(product),
                onDelete: () => handleRequestDelete(product),
              });

              const metaMap: Record<string, MetaItem> = {
                calories: {
                  icon: Flame,
                  text: Math.round(product.calories || 0),
                  tooltip: 'Ккал',
                },
                proteins: {
                  icon: Beef,
                  text: Math.round((product.proteins || 0) * 10) / 10,
                  tooltip: 'Белки',
                },
                fats: {
                  icon: Droplet,
                  text: Math.round((product.fats || 0) * 10) / 10,
                  tooltip: 'Жиры',
                },
                carbs: {
                  icon: Wheat,
                  text: Math.round((product.carbs || 0) * 10) / 10,
                  tooltip: 'Углеводы',
                },
                portions: {
                  icon: PieChart, // Заменили Box на PieChart
                  text: product.portions.length,
                  tooltip: 'Вариантов порций',
                },
              };

              const metaItems = visibleFields.map((id) => metaMap[id]).filter(Boolean);

              return viewMode === 'compact' ? (
                <EntityListItem
                  key={product.id}
                  title={cardConfig.title(product)}
                  meta={metaItems}
                  isSelected={activeId === product.id}
                  isMultiSelected={selectedProductIds.includes(product.id)}
                  onSelect={() => setActiveId(product.id)}
                  onMultiSelect={() => toggleProductSelection(product.id)}
                  onRequestMultiSelectMode={() => {
                    if (!showMultiSelect) {
                      setShowMultiSelect(true);
                      setSelectedProductIds([product.id]);
                    }
                  }}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                  variant="neutral"
                />
              ) : (
                <EntityCard
                  key={product.id}
                  title={cardConfig.title(product)}
                  subtitle={cardConfig.subtitle?.(product, { category })}
                  icon={productEntityConfig.getIcon(product)}
                  iconColor={productEntityConfig.getIconColor?.(product, { category })}
                  variant="product"
                  nutrition={{
                    calories: Math.round(product.calories || 0),
                    proteins: Math.round((product.proteins || 0) * 10) / 10,
                    fats: Math.round((product.fats || 0) * 10) / 10,
                    carbs: Math.round((product.carbs || 0) * 10) / 10,
                    portionCount: product.portions.length,
                  }}
                  isSelected={activeId === product.id}
                  isMultiSelected={selectedProductIds.includes(product.id)}
                  onSelect={() => setActiveId(product.id)}
                  onMultiSelect={() => toggleProductSelection(product.id)}
                  onRequestMultiSelectMode={() => {
                    if (!showMultiSelect) {
                      setShowMultiSelect(true);
                      setSelectedProductIds([product.id]);
                    }
                  }}
                  menuItems={actions}
                  showMultiSelect={showMultiSelect}
                />
              );
            })}
          </div>

          <div className="lg:col-span-2 hidden lg:block max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 custom-scrollbar pt-2">
            {creatingProduct ? (
              <div className="pl-1">
                <ProductForm
                  product={null}
                  onSubmit={handleInlineCreate}
                  onCancel={() => setCreatingProduct(false)}
                />
              </div>
            ) : selectedProduct ? (
              <ProductDetail
                product={selectedProduct}
                onEdit={() => selectedProduct && handleEdit(selectedProduct)}
                editTrigger={detailEditTrigger}
              />
            ) : (
              <div className="h-full flex items-start justify-center pt-16">
                <div className="text-center p-4">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Component className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Выберите продукт</h3>
                  <p className="text-muted-foreground">
                    Кликните на карточку для просмотра подробной информации.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 px-6 text-muted-foreground">
          <Component className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm || hasActiveFilters ? 'Продукты не найдены' : 'Продуктов пока нет'}
          </h3>
          {!searchTerm && !hasActiveFilters && (
            <Button onClick={handleAddNew} className="mt-4">
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить первый продукт
            </Button>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить продукт{' '}
          <span className="font-bold">{productToDelete?.name}</span>?
        </p>
      </ConfirmModal>

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Подтверждение удаления"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить {selectedProductIds.length} продуктов?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Это действие нельзя отменить. Все данные о продуктах будут потеряны.
          </span>
        </p>
      </ConfirmModal>

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        fileContent={fileContent}
      />
    </div>
  );
};

export default ProductsPage;
