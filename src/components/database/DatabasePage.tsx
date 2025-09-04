// src/components/database/DatabasePage.tsx

import React, { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import cn from 'classnames';
import { Filter, CirclePlus, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

import ProductsContent from './products/ProductsContent';
import DishesContent from './dishes/DishesContent';
import CategoriesContent from './categories/CategoriesContent';
import MealTypesContent from './mealtypes/MealTypesContent';
import Button from '../../ui/Button';
import ImportProductsModal from './products/ImportProductsModal';

type Tab = 'products' | 'dishes' | 'categories' | 'meal-types';

const DatabasePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) || 'products';

  const [addHandler, setAddHandler] = useState<(() => void) | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setSearchParams({ tab });
  };

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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
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
            onClick={() => setShowFilters((prev) => !prev)}
            disabled={activeTab !== 'products'}
            title="Фильтр"
          >
            <Filter className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={activeTab !== 'products'}
            title="Импорт"
          >
            <UploadCloud className="w-4 h-4" />
          </Button>
          <Button variant="primary" onClick={addHandler || undefined}>
            <CirclePlus className="w-4 h-4 mr-2" />
            Добавить {getAddButtonText()}
          </Button>
        </div>
      </div>

      <div>
        {activeTab === 'products' && (
          <ProductsContent setAddHandler={setAddHandler} showFilters={showFilters} />
        )}
        {activeTab === 'dishes' && <DishesContent setAddHandler={setAddHandler} />}
        {activeTab === 'categories' && <CategoriesContent setAddHandler={setAddHandler} />}
        {activeTab === 'meal-types' && <MealTypesContent setAddHandler={setAddHandler} />}
      </div>

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        fileContent={fileContent}
      />
    </div>
  );
};

export default DatabasePage;
