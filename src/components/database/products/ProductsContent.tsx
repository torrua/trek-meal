// src/components/database/products/ProductsContent.tsx

import React, { useState, useMemo } from 'react';
import useProductStore from '../../../stores/useProductStore';
import useCategoryStore from '../../../stores/useCategoryStore';
import useSearchStore from '../../../stores/useSearchStore';
import type { Product, Category, ProductData } from '../../../types';
import ProductCard from '../../products/ProductCard';
import ProductForm from '../../products/ProductForm';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import ConfirmModal from '../../../ui/ConfirmModal';
import ThemedSelect from '../../../ui/ThemedSelect';
import { Plus } from 'lucide-react';

type CategoryOption = { value: string; label: string };

const ProductsContent: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const lowercasedFilter = searchTerm.trim().toLowerCase();

    return products.filter((p: Product) => {
      const categoryMatch =
        filterCategory.value === 'all' || String(p.categoryId) === filterCategory.value;
      if (!categoryMatch) {
        return false;
      }

      if (lowercasedFilter) {
        const searchMatch =
          p.name.toLowerCase().includes(lowercasedFilter) ||
          p.description?.toLowerCase().includes(lowercasedFilter);
        return searchMatch;
      }

      return true;
    });
  }, [products, searchTerm, filterCategory]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleRequestDelete = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
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
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <ThemedSelect<CategoryOption>
          className="w-full md:w-56"
          value={filterCategory}
          options={categoryOptions}
          onChange={(option) => setFilterCategory(option as CategoryOption)}
        />
        <Button onClick={handleAddNew} variant="primary" className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Добавить продукт
        </Button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium text-foreground">
            {searchTerm || filterCategory.value !== 'all'
              ? 'Продукты не найдены'
              : 'Продуктов пока нет'}
          </h3>
          <p className="text-muted-foreground mt-2 mb-4">
            {searchTerm || filterCategory.value !== 'all'
              ? 'Попробуйте изменить поисковый запрос или фильтр.'
              : 'Добавьте первый продукт для начала работы.'}
          </p>
          {searchTerm || filterCategory.value !== 'all' ? null : (
            <Button onClick={handleAddNew} variant="primary">
              Добавить первый продукт
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p: Product) => (
            <ProductCard
              key={p.id}
              product={p}
              onEdit={() => handleEdit(p)}
              onDelete={(e) => handleRequestDelete(e, p)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Редактировать продукт' : 'Новый продукт'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
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
