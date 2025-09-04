// src/components/database/products/ImportProductsModal.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-hot-toast';
import type { ProductData, Category } from '../../../types';
import useCategoryStore from '../../../stores/useCategoryStore';
import useProductStore from '../../../stores/useProductStore';
import Modal from '../../../ui/Modal';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import ThemedSelect from '../../../ui/ThemedSelect';
import { AlertTriangle, CheckCircle, PackagePlus, FileQuestion } from 'lucide-react';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: any;
}

type CategoryMap = Record<number, number | 'new'>;
type NewCategoryNames = Record<number, string>;
type CategoryOption = { value: number | 'new'; label: string };

const ImportProductsModal: React.FC<ImportProductsModalProps> = ({
  isOpen,
  onClose,
  fileContent,
}) => {
  const { categories, addCategory } = useCategoryStore();
  const { addMultipleProducts } = useProductStore();

  const [productsToImport, setProductsToImport] = useState<ProductData[]>([]);
  const [unmappedCategories, setUnmappedCategories] = useState<number[]>([]);
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});
  const [newCategoryNames, setNewCategoryNames] = useState<NewCategoryNames>({});
  const [defaultPortion, setDefaultPortion] = useState({ name: 'Стандартная', weight: 100 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (fileContent && fileContent.products && Array.isArray(fileContent.products)) {
      setProductsToImport(fileContent.products);
      const importedCategoryIds = new Set(
        fileContent.products.map((p: ProductData) => p.categoryId).filter(Boolean)
      );
      const existingCategoryIds = new Set(categories.map((c) => c.id));
      const newUnmapped = Array.from(importedCategoryIds).filter(
        (id) => !existingCategoryIds.has(id as number)
      ) as number[];
      setUnmappedCategories(newUnmapped);
    } else {
      setProductsToImport([]);
      setUnmappedCategories([]);
    }
  }, [fileContent, categories]);

  const categoryOptions: CategoryOption[] = [
    { value: 'new', label: '＋ Создать новую категорию' },
    ...categories.map((c: Category) => ({ value: c.id, label: c.name })),
  ];

  const handleCategoryMappingChange = (importedId: number, option: SingleValue<CategoryOption>) => {
    setCategoryMap((prev) => ({ ...prev, [importedId]: option?.value ?? '' }));
  };

  const isReadyToImport = useMemo(() => {
    const allCategoriesMapped = unmappedCategories.every((id) => {
      const mapping = categoryMap[id];
      if (!mapping) return false;
      if (mapping === 'new' && !newCategoryNames[id]?.trim()) return false;
      return true;
    });
    return allCategoriesMapped && defaultPortion.name.trim() && defaultPortion.weight > 0;
  }, [unmappedCategories, categoryMap, newCategoryNames, defaultPortion]);

  const handleImport = async () => {
    setIsProcessing(true);
    const finalCategoryMap: Record<number, number> = {};

    for (const importedId of unmappedCategories) {
      const mapping = categoryMap[importedId];
      if (mapping === 'new') {
        const newCategoryName = newCategoryNames[importedId];
        const newCategory = addCategory({ name: newCategoryName, color: '#cccccc', emoji: '📦' });
        finalCategoryMap[importedId] = newCategory.id;
      } else {
        finalCategoryMap[importedId] = mapping;
      }
    }

    const processedProducts: ProductData[] = productsToImport.map((product) => {
      const newCategoryId =
        product.categoryId && finalCategoryMap[product.categoryId]
          ? finalCategoryMap[product.categoryId]
          : product.categoryId;
      return {
        ...product,
        categoryId: newCategoryId,
        portions: [defaultPortion],
      };
    });

    addMultipleProducts(processedProducts);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Импорт продуктов" size="xl">
      <div className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">
            Найдено <strong>{productsToImport.length}</strong> продуктов для импорта.
          </p>
        </div>

        {unmappedCategories.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-amber-500" />
              Сопоставление категорий
            </h3>
            <p className="text-sm text-muted-foreground">
              Некоторые категории из файла не найдены. Укажите, что с ними делать.
            </p>
            {unmappedCategories.map((id) => (
              <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                  <span className="text-sm">
                    Категория из файла (ID: <span className="font-mono">{id}</span>)
                  </span>
                </div>
                <div>
                  <ThemedSelect
                    options={categoryOptions}
                    onChange={(option) => handleCategoryMappingChange(id, option)}
                    placeholder="Выберите действие..."
                    menuPortalTarget={document.body}
                  />
                  {categoryMap[id] === 'new' && (
                    <Input
                      containerClassName="mt-2"
                      placeholder="Название новой категории..."
                      onChange={(e) =>
                        setNewCategoryNames((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            Порция по умолчанию
          </h3>
          <p className="text-sm text-muted-foreground">
            Укажите стандартную порцию, которая будет добавлена ко всем импортируемым продуктам.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название порции *"
              value={defaultPortion.name}
              onChange={(e) => setDefaultPortion((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="Вес (г) *"
              type="number"
              value={defaultPortion.weight}
              onChange={(e) =>
                setDefaultPortion((p) => ({ ...p, weight: parseInt(e.target.value, 10) || 0 }))
              }
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleImport} disabled={!isReadyToImport || isProcessing}>
          {isProcessing ? 'Обработка...' : 'Импортировать'}
        </Button>
      </div>
    </Modal>
  );
};

export default ImportProductsModal;
