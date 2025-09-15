// src/components/Dashboard.tsx - Notion-inspired redesign

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
import ProductForm from './products/ProductForm';
import type { Trip, Product, ProductData, Category } from '../types';
import { MapPin, Package, Users, Calendar, TrendingUp, ChevronRight, Plus } from 'lucide-react';

// Notion-style Stat Card
const NotionStatCard = ({
  value,
  label,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  icon?: React.ElementType;
}) => (
  <div className="group bg-white dark:bg-dark-secondary rounded-notion-md border border-border dark:border-dark-border p-notion-md transition-all duration-200 hover:shadow-notion-md hover:-translate-y-0.5 cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <span className="text-notion-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="text-2xl font-bold text-foreground dark:text-white">{value}</div>
  </div>
);

// Notion-style Product Mini Card
const NotionProductCard = ({
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
      className="group bg-muted dark:bg-dark-tertiary rounded-notion-md p-notion-md 
                 transition-all duration-200 hover:bg-background dark:hover:bg-dark-secondary 
                 hover:shadow-notion-sm hover:translate-x-1 cursor-pointer border border-transparent 
                 hover:border-border dark:hover:border-dark-border"
      onClick={() => onEdit(product)}
    >
      <div className="flex justify-between items-center">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-notion-sm text-foreground dark:text-white truncate">
            {product.name}
          </h4>
          <p className="text-notion-xs text-muted-foreground mt-0.5">
            {product.calories} ккал • {product.proteins}б / {product.fats}ж / {product.carbs}у
          </p>
        </div>
        {category && (
          <span
            className="ml-3 px-2 py-1 text-notion-xs font-medium rounded-notion-sm flex-shrink-0"
            style={{
              backgroundColor: `${category.color}15`,
              color: category.color,
            }}
          >
            {category.emoji} {category.name}
          </span>
        )}
      </div>
    </div>
  );
};

// Notion-style Trip Card
const NotionTripCard = ({
  trip,
  summary,
  onClick,
}: {
  trip: Trip;
  summary: any;
  onClick: () => void;
}) => {
  const statusColors = {
    planning: 'bg-primary/10 text-primary dark:bg-primary/20',
    completed: 'bg-success/10 text-success dark:bg-success/20',
    cancelled: 'bg-danger/10 text-danger dark:bg-danger/20',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-dark-secondary rounded-notion-lg border border-border 
                 dark:border-dark-border p-notion-lg transition-all duration-200 
                 hover:shadow-notion-md hover:border-primary/20 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-notion-base text-foreground dark:text-white">
            {trip.name}
          </h4>
        </div>
        <span
          className={`px-2 py-1 rounded-notion-sm text-notion-xs font-medium ${statusColors[trip.status]}`}
        >
          {trip.status === 'planning'
            ? 'Планируется'
            : trip.status === 'completed'
              ? 'Завершен'
              : 'Отменен'}
        </span>
      </div>

      <div className="text-notion-xs text-muted-foreground mb-3">
        {new Date(trip.createdAt).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-notion-lg font-semibold text-foreground dark:text-white">
            {trip.days}
          </div>
          <div className="text-notion-xs text-muted-foreground">дней</div>
        </div>
        <div className="text-center">
          <div className="text-notion-lg font-semibold text-foreground dark:text-white">
            {trip.participants.length}
          </div>
          <div className="text-notion-xs text-muted-foreground">чел.</div>
        </div>
        <div className="text-center">
          <div className="text-notion-lg font-semibold text-foreground dark:text-white">
            {(summary.totalWeight / 1000).toFixed(1)}
          </div>
          <div className="text-notion-xs text-muted-foreground">кг</div>
        </div>
        <div className="text-center">
          <div className="text-notion-lg font-semibold text-foreground dark:text-white">
            {summary.averageCaloriesPerPersonPerDay}
          </div>
          <div className="text-notion-xs text-muted-foreground">ккал</div>
        </div>
      </div>

      <div
        className="mt-3 pt-3 border-t border-border dark:border-dark-border 
                      flex items-center justify-end text-notion-xs text-muted-foreground 
                      group-hover:text-primary transition-colors"
      >
        Открыть детали
        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

// Empty State Component
const NotionEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) => (
  <div
    className="bg-muted dark:bg-dark-tertiary rounded-notion-lg border-2 border-dashed 
                  border-border dark:border-dark-border p-notion-2xl text-center"
  >
    <div className="max-w-sm mx-auto">
      <h3 className="text-notion-lg font-semibold text-foreground dark:text-white mb-2">{title}</h3>
      <p className="text-notion-sm text-muted-foreground mb-4">{description}</p>
      <button
        onClick={onAction}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white 
                   rounded-notion-md font-medium text-notion-sm transition-all 
                   hover:bg-primary/90 hover:shadow-notion-md"
      >
        <Plus className="w-4 h-4" />
        {actionLabel}
      </button>
    </div>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const { trips } = useTripStore();
  const { products, updateProduct, addProduct } = useProductStore();
  const { participants } = useParticipantStore();
  const { dishes } = useDishStore();

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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleProductFormSubmit = (formData: ProductData) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsProductModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <div className="max-w-7xl mx-auto px-notion-lg py-notion-2xl">
        {/* Page Header */}
        <div className="mb-notion-xl">
          <h1 className="text-3xl font-bold text-foreground dark:text-white tracking-tight">
            Обзор
          </h1>
          <p className="text-notion-base text-muted-foreground mt-1">
            Управляйте походами, продуктами и участниками
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-notion-md mb-notion-2xl">
          <NotionStatCard value={trips.length} label="Всего походов" icon={MapPin} />
          <NotionStatCard value={products.length} label="Продуктов" icon={Package} />
          <NotionStatCard value={participants.length} label="Участников" icon={Users} />
          <NotionStatCard value={planningCount} label="Планируется" icon={Calendar} />
          <NotionStatCard value={completedCount} label="Завершено" icon={TrendingUp} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-notion-xl">
          {/* Recent Trips Section */}
          <section>
            <div className="flex items-center justify-between mb-notion-lg">
              <h2 className="text-notion-xl font-semibold text-foreground dark:text-white">
                Последние походы
              </h2>
              <button
                onClick={() => navigate('/trips')}
                className="text-notion-sm text-muted-foreground hover:text-primary 
                           transition-colors flex items-center gap-1"
              >
                Все походы
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-notion-md">
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => {
                  const summary = calculateTripSummary(trip, products, participants, dishes);
                  return (
                    <NotionTripCard
                      key={trip.id}
                      trip={trip}
                      summary={summary}
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    />
                  );
                })
              ) : (
                <NotionEmptyState
                  title="Нет походов"
                  description="Создайте свой первый поход, чтобы начать планирование"
                  actionLabel="Создать поход"
                  onAction={() => navigate('/trips')}
                />
              )}
            </div>
          </section>

          {/* Recent Products Section */}
          <section>
            <div className="flex items-center justify-between mb-notion-lg">
              <h2 className="text-notion-xl font-semibold text-foreground dark:text-white">
                Недавние продукты
              </h2>
              <button
                onClick={() => navigate('/products')}
                className="text-notion-sm text-muted-foreground hover:text-primary 
                           transition-colors flex items-center gap-1"
              >
                Все продукты
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {recentProducts.length > 0 ? (
                recentProducts.map((product: Product) => (
                  <NotionProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                  />
                ))
              ) : (
                <NotionEmptyState
                  title="База продуктов пуста"
                  description="Добавьте продукты для планирования питания в походах"
                  actionLabel="Добавить продукт"
                  onAction={() => navigate('/products')}
                />
              )}
            </div>
          </section>
        </div>

        {/* Product Edit Modal */}
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
    </div>
  );
}

export default Dashboard;
