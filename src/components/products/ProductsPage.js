import React, { useState, useMemo } from 'react';
import useProductStore from '../../stores/useProductStore';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProducts = useMemo(() => 
    products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
  );

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };
  
  const handleDelete = (id) => {
    // В реальном приложении здесь было бы кастомное модальное окно подтверждения
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      deleteProduct(id);
    }
  };

  const handleFormSubmit = (formData) => {
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
          <input 
            type="text" 
            placeholder="Поиск продуктов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <Button onClick={handleAddNew} variant="primary" className="whitespace-nowrap">+ Добавить продукт</Button>
        </div>
      </header>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm ? 'Продукты не найдены' : 'Продуктов пока нет'}
          </h3>
          <p className="text-gray-500 mt-2 mb-4">
            {searchTerm ? 'Попробуйте изменить поисковый запрос.' : 'Добавьте первый продукт для начала работы.'}
          </p>
          {!searchTerm && <Button onClick={handleAddNew} variant="primary">Добавить первый продукт</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <ProductCard 
              key={p.id} 
              product={p}
              onEdit={() => handleEdit(p)}
              onDelete={() => handleDelete(p.id)}
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
    </div>
  );
}

export default ProductsPage;