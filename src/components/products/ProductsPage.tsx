// src/components/products/ProductsPage.tsx

import React, { useState, useMemo } from 'react';
import useProductStore from '../../stores/useProductStore';
import useCategoryStore from '../../stores/useCategoryStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Product, Category, ProductData } from '../../types';

import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();
  const { searchTerm } = useSearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredProducts = useMemo(() => {
    const lowercasedFilter = searchTerm.trim().toLowerCase();

    return products.filter((p: Product) => {
      const categoryMatch = filterCategory === 'all' || String(p.categoryId) === filterCategory;
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

  // --- ИЗМЕНЕНИЕ ---
  const handleRequestDelete = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Останавливаем всплытие, чтобы не сработал клик по карточке
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
    <div className="p-6">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Управление продуктами</h2>
        <div className="flex items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="all">Все категории</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <Button onClick={handleAddNew} variant="primary" className="whitespace-nowrap">
            + Добавить продукт
          </Button>
        </div>
      </header>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm || filterCategory !== 'all' ? 'Продукты не найдены' : 'Продуктов пока нет'}
          </h3>
          <p className="text-gray-500 mt-2 mb-4">
            {searchTerm || filterCategory !== 'all'
              ? 'Попробуйте изменить поисковый запрос или фильтр.'
              : 'Добавьте первый продукт для начала работы.'}
          </p>
          {searchTerm || filterCategory !== 'all' ? null : (
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
              // --- ИЗМЕНЕНИЕ ---
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
}

export default ProductsPage;
