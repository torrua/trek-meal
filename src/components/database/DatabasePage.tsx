// src/components/database/DatabasePage.tsx

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import cn from 'classnames';
import { Filter, CirclePlus } from 'lucide-react';

import ProductsContent from './products/ProductsContent';
import DishesContent from './dishes/DishesContent';
import CategoriesContent from './categories/CategoriesContent';
import MealTypesContent from './mealtypes/MealTypesContent';
import Button from '../../ui/Button';

type Tab = 'products' | 'dishes' | 'categories' | 'meal-types';

const DatabasePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'products';

  const [addHandler, setAddHandler] = useState<(() => void) | null>(null);

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'products':
        return 'Продукт';
      case 'dishes':
        return 'Блюдо';
      case 'categories':
        return 'Категорию';
      case 'meal-types':
        return 'Прием пищи';
      default:
        return 'Элемент';
    }
  };

  const tabBaseClasses =
    'px-4 py-2.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap flex-shrink-0';
  const tabActiveClasses = 'bg-primary text-primary-foreground';
  const tabInactiveClasses = 'text-muted-foreground hover:bg-muted hover:text-foreground';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 p-1.5 bg-muted rounded-xl w-max">
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
            <button
              onClick={() => handleTabChange('meal-types')}
              className={cn(
                tabBaseClasses,
                activeTab === 'meal-types' ? tabActiveClasses : tabInactiveClasses
              )}
            >
              Приемы пищи
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => alert('Фильтр пока не реализован')}
            disabled={activeTab !== 'products'}
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button variant="primary" onClick={addHandler || undefined}>
            <CirclePlus className="w-4 h-4 mr-2" />
            Добавить {getAddButtonText()}
          </Button>
        </div>
      </div>

      <div>
        {activeTab === 'products' && <ProductsContent setAddHandler={setAddHandler} />}
        {activeTab === 'dishes' && <DishesContent setAddHandler={setAddHandler} />}
        {activeTab === 'categories' && <CategoriesContent setAddHandler={setAddHandler} />}
        {activeTab === 'meal-types' && <MealTypesContent setAddHandler={setAddHandler} />}
      </div>
    </div>
  );
};

export default DatabasePage;
