// src/pages/ProductsPage.tsx

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { CirclePlus, Filter, UploadCloud, Component } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useProductStore from '../stores/useProductStore';
import useSearchStore from '../stores/useSearchStore';
import useCategoryStore from '../stores/useCategoryStore';
import type { Product, ProductData, Category, ImportedJsonData } from '../types';
import ProductCard from '../components/products/ProductCard';
import ProductDetail from '../components/products/ProductDetail';
import ProductForm from '../components/products/ProductForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import ThemedSelect from '../ui/ThemedSelect';
import ImportProductsModal from '../components/products/ImportProductsModal';

type CategoryOption = { value: string; label: string };

const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState<CategoryOption>({
    value: 'all',
    label: 'Все категории',
  });
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<ImportedJsonData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions: CategoryOption[] = [
    { value: 'all', label: 'Все категории' },
    ...categories.map((cat: Category) => ({ value: String(cat.id), label: cat.name })),
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const categoryMatch =
        filterCategory.value === 'all' || String(p.categoryId) === filterCategory.value;
      const searchMatch =
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.trim().toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [products, searchTerm, filterCategory]);

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

  const handleRequestDelete = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

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
            >
              <Filter className="w-4 h-4" />
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
        <div className="mb-4">
          <ThemedSelect<CategoryOption>
            className="w-full sm:max-w-xs"
            value={filterCategory}
            options={categoryOptions}
            onChange={(option) => setFilterCategory(option as CategoryOption)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Component className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm || filterCategory.value !== 'all'
                  ? 'Продукты не найдены'
                  : 'Продуктов пока нет'}
              </h3>
              {!searchTerm && filterCategory.value === 'all' && (
                <Button onClick={handleAddNew} className="mt-4">
                  <CirclePlus className="w-4 h-4 mr-2" />
                  Добавить первый продукт
                </Button>
              )}
            </div>
          ) : (
            filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isSelected={activeId === p.id}
                onSelect={() => setActiveId(p.id)}
                onEdit={() => handleEdit(p)}
                onDelete={(e) => handleRequestDelete(e, p)}
              />
            ))
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
