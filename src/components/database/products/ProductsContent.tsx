// src/components/database/products/ProductsContent.tsx

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import useProductStore from '../../../stores/useProductStore';
import useSearchStore from '../../../stores/useSearchStore';
import type { Product, ProductData } from '../../../types';
import ProductCard from '../products/ProductCard';
import ProductDetail from '../products/ProductDetail';
import ProductForm from './ProductForm'; // Изменена вложенность
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import ConfirmModal from '../../../ui/ConfirmModal';
import { Component, CirclePlus, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ImportProductsModal from './ImportProductsModal';

interface ProductsContentProps {
  setAddHandler: (handler: (() => void) | null) => void;
}

const ProductsContent: React.FC<ProductsContentProps> = ({ setAddHandler }) => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { searchTerm } = useSearchStore();

  const [activeId, setActiveId] = useState<number | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        !searchTerm.trim() ||
        p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
  }, [products, searchTerm]);

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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <div className="lg:col-span-1">
        <div className="flex justify-end mb-4">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-4 h-4 mr-2" />
            Импорт
          </Button>
        </div>
        <div className="h-[calc(100vh-420px)] min-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-6 text-gray-500">
              <Component className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm ? 'Продукты не найдены' : 'Продуктов пока нет'}
              </h3>
              {!searchTerm && (
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

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        fileContent={fileContent}
      />
    </div>
  );
};

export default ProductsContent;
