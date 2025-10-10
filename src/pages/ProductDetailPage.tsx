// src/pages/ProductDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useProductStore from '../stores/useProductStore';
import ProductForm from '../components/products/ProductForm';
import type { ProductData } from '../types';
import { ArrowLeft, Component } from 'lucide-react';
import Button from '../ui/Button';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const isNew = !productId || productId === 'new';
  const numericId = !isNew && productId ? parseInt(productId, 10) : null;

  const { products, addProduct, updateProduct } = useProductStore();
  const product = useMemo(
    () => (numericId ? products.find((p) => p.id === numericId) || null : null),
    [numericId, products]
  );

  if (!isNew && !product) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Продукт не найден</h2>
          <Link to="/products" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: ProductData) => {
    if (isNew) {
      addProduct(data);
    } else if (numericId) {
      updateProduct(numericId, data);
    }
    navigate('/products');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/products')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Component className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новый продукт' : 'Редактирование продукта'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Заполните данные нового продукта.'
                : 'Обновите данные существующего продукта.'}
            </p>
          </div>
        </div>

        <ProductForm
          product={product ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/products')}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
