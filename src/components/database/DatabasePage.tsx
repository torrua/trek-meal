// src/components/database/DatabasePage.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import cn from 'classnames';

// Импортируем "внутренности" бывших страниц
import ProductsContent from './products/ProductsContent';
import DishesContent from './dishes/DishesContent';
import CategoriesContent from './categories/CategoriesContent';

type Tab = 'products' | 'dishes' | 'categories';

const DatabasePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'products';

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

  const tabBaseClasses =
    'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const tabActiveClasses = 'bg-primary text-primary-foreground';
  const tabInactiveClasses = 'text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <div className="p-4 sm:p-6">
      <header className="mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-foreground">Питание</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление базой данных продуктов, блюд и категорий для ваших походов.
        </p>
      </header>

      <div className="mb-6">
        <div className="flex items-center gap-2 p-1.5 bg-muted rounded-xl w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('products')}
            className={cn(
              tabBaseClasses,
              activeTab === 'products' ? tabActiveClasses : tabInactiveClasses
            )}
          >
            Продукты
          </button>
          <button
            onClick={() => handleTabChange('dishes')}
            className={cn(
              tabBaseClasses,
              activeTab === 'dishes' ? tabActiveClasses : tabInactiveClasses
            )}
          >
            Блюда
          </button>
          <button
            onClick={() => handleTabChange('categories')}
            className={cn(
              tabBaseClasses,
              activeTab === 'categories' ? tabActiveClasses : tabInactiveClasses
            )}
          >
            Категории
          </button>
        </div>
      </div>

      <div>
        {activeTab === 'products' && <ProductsContent />}
        {activeTab === 'dishes' && <DishesContent />}
        {activeTab === 'categories' && <CategoriesContent />}
      </div>
    </div>
  );
};

export default DatabasePage;
