// src/pages/ProductsPage.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CirclePlus, Filter, UploadCloud, Component } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useProductStore from '../stores/useProductStore';
import useCategoryStore from '../stores/useCategoryStore';
import useSearchStore from '../stores/useSearchStore';
import type { Product, ProductData, ImportedJsonData, Category } from '../types';
import EntityCard from '../ui/EntityCard';
import ProductDetail from '../components/products/ProductDetail';
import ProductForm from '../components/products/ProductForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import ImportProductsModal from '../components/products/ImportProductsModal';
import ProductFiltersComponent, {
  ProductFilters,
} from '../components/products/ProductFiltersComponent';
import { productEntityConfig } from '../config/entityConfig';

const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<ImportedJsonData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filters, setFilters] = useState<ProductFilters>({ categoryId: 'all' });

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
          filters.categoryId === 'all' || String(p.categoryId) === filters.categoryId;
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
    setEditingProduct(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormModalOpen(true);
  }, []);

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

  const handleFormSubmit = (formData: ProductData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setFormModalOpen(false);
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

  const hasActiveFilters = useMemo(() => filters.categoryId !== 'all', [filters]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Продукты</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowFilters((prev) => !prev)}
              title="Фильтр"
              className="relative"
            >
              <Filter className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-card" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Импорт"
            >
              <UploadCloud className="w-4 h-4" />
            </Button>
            <Button variant="primary" onClick={handleAddNew}>
              <CirclePlus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить продукт</span>
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 sm:mb-6 bg-card rounded-xl border p-3 sm:p-4">
          <ProductFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredProducts.length === 0 ? (
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
          ) : (
            filteredProducts.map((product) => {
              const category = categories.find((c: Category) => c.id === product.categoryId);
              const cardConfig = productEntityConfig.views.card;
              const actions = productEntityConfig.getActions({
                onEdit: () => handleEdit(product),
                onDelete: () => handleRequestDelete(product),
              });

              return (
                <EntityCard
                  key={product.id}
                  title={cardConfig.title(product)}
                  subtitle={cardConfig.subtitle?.(product, { category })}
                  icon={productEntityConfig.getIcon(product)}
                  iconColor={productEntityConfig.getIconColor?.(product, { category })}
                  details={cardConfig.details(product)}
                  menuItems={actions}
                  isSelected={activeId === product.id}
                  onSelect={() => setActiveId(product.id)}
                  borderColor={productEntityConfig.getBorderColor(product, { category })}
                />
              );
            })
          )}
        </div>

        <div className="lg:col-span-2 hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7.5rem)]">
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onEdit={() => selectedProduct && handleEdit(selectedProduct)}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
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

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? 'Редактировать продукт' : 'Новый продукт'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormModalOpen(false)}
        />
      </Modal>

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

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        fileContent={fileContent}
      />
    </div>
  );
};

export default ProductsPage;
