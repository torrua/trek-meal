// src/components/database/products/ProductsContent.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useProductStore from '../../stores/useProductStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Product, ProductData, Category } from '../../types';
import ProductCard from '../products/ProductCard';
import ProductDetail from '../products/ProductDetail';
import ProductForm from './ProductForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';
import { Component, CirclePlus } from 'lucide-react';
import ThemedSelect from '../../ui/ThemedSelect';
import useCategoryStore from '../../stores/useCategoryStore';

interface ProductsContentProps {
  setAddHandler: (handler: (() => void) | null) => void;
  showFilters: boolean;
}

type CategoryOption = { value: string; label: string };

const ProductsContent: React.FC<ProductsContentProps> = ({ setAddHandler, showFilters }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<CategoryOption>({
    value: 'all',
    label: 'Все категории',
  });

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

  useEffect(() => {
    setAddHandler(() => handleAddNew);
    return () => setAddHandler(null);
  }, [setAddHandler, handleAddNew]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-full">
      <div className="lg:col-span-1">
        {showFilters && (
          <div className="mb-4">
            <ThemedSelect<CategoryOption>
              className="w-full"
              value={filterCategory}
              options={categoryOptions}
              onChange={(option) => setFilterCategory(option as CategoryOption)}
            />
          </div>
        )}
        <div className="h-[calc(100vh-360px)] min-h-[400px] overflow-y-auto pr-2 space-y-3 notion-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-6 text-muted-foreground">
              <Component className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-notion-lg font-medium text-foreground">
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
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <ProductDetail
          product={selectedProduct}
          onEdit={() => selectedProduct && handleEdit(selectedProduct)}
        />
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
    </div>
  );
};

export default ProductsContent;
