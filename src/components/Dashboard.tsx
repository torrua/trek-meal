// src/components/Dashboard.tsx

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useTripStore from '../stores/useTripStore';
import useProductStore from '../stores/useProductStore';
import useParticipantStore from '../stores/useParticipantStore';
import useDishStore from '../stores/useDishStore';
import useCategoryStore from '../stores/useCategoryStore';
import { calculateTripSummary } from '../utils';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import ProductForm from './database/products/ProductForm';
import type { Trip, Product, ProductData, Category } from '../types';

// Карточка для статистики
const StatCard = ({ value, label }: { value: number | string; label: string }) => (
  <div className="p-4 bg-secondary border border-primary rounded-lg text-center shadow-sm">
    <div className="text-3xl font-bold text-blue-600">{value}</div>
    <div className="text-sm font-medium text-muted-foreground mt-1">{label}</div>
  </div>
);

// --- НОВЫЙ КОМПОНЕНТ: Компактная карточка продукта для дашборда ---
const ProductMiniCard = ({
  product,
  onEdit,
}: {
  product: Product;
  onEdit: (product: Product) => void;
}) => {
  const { categories } = useCategoryStore();
  const category = categories.find((c: Category) => c.id === product.categoryId);

  return (
    <div
      className="p-3 bg-secondary border rounded-lg shadow-sm flex justify-between items-center cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onEdit(product)}
    >
      <div>
        <h4 className="font-bold text-primary text-sm">{product.name}</h4>
        <p className="text-xs text-muted-foreground">
          {product.calories} ккал, {product.proteins}б / {product.fats}ж / {product.carbs}у
        </p>
      </div>
      {category && (
        <span
          className="px-2 py-0.5 text-xs font-medium text-white rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color }}
        >
          {category.emoji} {category.name}
        </span>
      )}
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();
  const { trips } = useTripStore();
  const { products, updateProduct, addProduct } = useProductStore();
  const { participants } = useParticipantStore();
  const { dishes } = useDishStore();

  // --- НОВЫЙ КОД: Состояние для модального окна редактирования продукта ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const recentTrips = useMemo(
    () =>
      [...trips]
        .sort(
          (a: Trip, b: Trip) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3),
    [trips]
  );

  const recentProducts = useMemo(() => [...products].reverse().slice(0, 5), [products]);
  const planningCount = useMemo(
    () => trips.filter((t: Trip) => t.status === 'planning').length,
    [trips]
  );
  const completedCount = useMemo(
    () => trips.filter((t: Trip) => t.status === 'completed').length,
    [trips]
  );

  // --- НОВЫЙ КОД: Обработчики для модального окна ---
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = (formData: ProductData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData); // На случай, если решим добавить кнопку "Создать" на дашборд
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary mb-6 pb-4 border-b">Обзор</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard value={trips.length} label="Всего походов" />
        <StatCard value={products.length} label="Продуктов в базе" />
        <StatCard value={participants.length} label="Участников" />
        <StatCard value={planningCount} label="Планируется" />
        <StatCard value={completedCount} label="Завершено" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">Последние походы</h3>
            <Button variant="ghost" onClick={() => navigate('/trips')}>
              Все походы
            </Button>
          </div>
          <div className="space-y-3">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip) => {
                const summary = calculateTripSummary(trip, products, participants, dishes);
                return (
                  <div
                    key={trip.id}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="p-4 bg-secondary border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between">
                      <h4 className="font-bold text-primary">{trip.name}</h4>
                      <span className="text-xs font-medium text-muted-foreground">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-3 text-center text-sm">
                      <div>
                        <strong className="block text-blue-600">{trip.days}</strong>
                        <span className="text-xs text-muted-foreground">дней</span>
                      </div>
                      <div>
                        <strong className="block text-blue-600">{trip.participants.length}</strong>
                        <span className="text-xs text-muted-foreground">чел.</span>
                      </div>
                      <div>
                        <strong className="block text-blue-600">
                          {(summary.totalWeight / 1000).toFixed(1)}
                        </strong>
                        <span className="text-xs text-muted-foreground">кг</span>
                      </div>
                      <div>
                        <strong className="block text-blue-600">
                          {summary.averageCaloriesPerPersonPerDay}
                        </strong>
                        <span className="text-xs text-muted-foreground">ккал/день</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-6 bg-muted rounded-lg">
                <h3 className="text-lg font-medium-foreground text-secondary">
                  Пока нет ни одного похода
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Создайте свой первый поход, чтобы он появился здесь.
                </p>
                <Button variant="primary" onClick={() => navigate('/trips')}>
                  К поxoдам
                </Button>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-primary">Недавно добавленные продукты</h3>
            <Button variant="ghost" onClick={() => navigate('/products')}>
              Все продукты
            </Button>
          </div>
          {/* --- ИЗМЕНЕНИЕ: Используем ProductMiniCard --- */}
          <div className="space-y-2">
            {recentProducts.length > 0 ? (
              recentProducts.map((product: Product) => (
                <ProductMiniCard key={product.id} product={product} onEdit={handleEditProduct} />
              ))
            ) : (
              <div className="text-center py-12 px-6 bg-muted rounded-lg">
                <h3 className="text-lg font-medium text-secondary">База продуктов пуста</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  Добавьте продукты, чтобы они отображались здесь.
                </p>
                <Button variant="primary" onClick={() => navigate('/products')}>
                  К продуктам
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* --- НОВЫЙ КОД: Модальное окно для быстрого редактирования --- */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Редактировать продукт"
      >
        <ProductForm
          product={editingProduct}
          onSubmit={handleProductFormSubmit}
          onCancel={() => setIsProductModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default Dashboard;
