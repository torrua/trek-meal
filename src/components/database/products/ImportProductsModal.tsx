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
import { CheckCircle, PackagePlus, Info } from 'lucide-react';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileContent: any;
}

type CategoryOption = { value: number | string; label: string; __isNew__?: boolean };
type StagedProduct = ProductData & { originalCategoryId?: number | null };

const ImportProductsModal: React.FC<ImportProductsModalProps> = ({
  isOpen,
  onClose,
  fileContent,
}) => {
  const { categories, addCategory } = useCategoryStore();
  const { products: existingProducts, addMultipleProducts } = useProductStore();

  const [stagedProducts, setStagedProducts] = useState<StagedProduct[]>([]);
  const [totalProductsInFile, setTotalProductsInFile] = useState(0);
  const [defaultPortion, setDefaultPortion] = useState({ name: 'Стандартная', weight: 100 });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (fileContent && fileContent.products && Array.isArray(fileContent.products)) {
      setTotalProductsInFile(fileContent.products.length);
      const existingProductNames = new Set(existingProducts.map((p) => p.name.toLowerCase()));
      const productsToStage: StagedProduct[] = fileContent.products
        .filter((p: any) => p.name && !existingProductNames.has(p.name.toLowerCase()))
        .map((p: any) => ({
          ...p,
          categoryId: p.categoryId || null,
        }));
      setStagedProducts(productsToStage);
    } else {
      setStagedProducts([]);
      setTotalProductsInFile(0);
    }
  }, [fileContent, existingProducts]);

  const categoryOptions: CategoryOption[] = categories.map((c: Category) => ({
    value: c.id,
    label: c.name,
  }));

  const handleCategoryChange = (index: number, option: SingleValue<CategoryOption>) => {
    const newStagedProducts = [...stagedProducts];
    if (option && option.__isNew__) {
      const newCategory = addCategory({ name: option.label, color: '#cccccc', emoji: '📦' });
      newStagedProducts[index].categoryId = newCategory.id;
    } else {
      newStagedProducts[index].categoryId = (option?.value as number) ?? null;
    }
    setStagedProducts(newStagedProducts);
  };

  const isReadyToImport = useMemo(() => {
    return stagedProducts.length > 0 && defaultPortion.name.trim() && defaultPortion.weight > 0;
  }, [stagedProducts, defaultPortion]);

  const handleImport = async () => {
    setIsProcessing(true);
    const processedProducts: ProductData[] = stagedProducts.map((product) => {
      const { originalCategoryId: _original, ...productData } = product;
      return {
        ...productData,
        portions: [defaultPortion],
      };
    });

    addMultipleProducts(processedProducts);
    setIsProcessing(false);
    onClose();
  };

  const duplicatesCount = totalProductsInFile - stagedProducts.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Импорт продуктов" size="xl">
      <div className="space-y-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">
            Найдено <strong>{totalProductsInFile}</strong> продуктов. Готово к импорту:{' '}
            <strong>{stagedProducts.length}</strong>.
          </p>
        </div>
        {duplicatesCount > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-center gap-3">
            <Info className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 dark:text-amber-200">
              <strong>{duplicatesCount}</strong> продуктов уже существуют в вашей базе и будут
              пропущены.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            Порция по умолчанию
          </h3>
          <p className="text-sm text-muted-foreground">
            Эта порция будет добавлена ко всем импортируемым продуктам.
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

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
          {stagedProducts.map((product, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <span className="font-medium truncate">{product.name}</span>
              <ThemedSelect
                isCreatable
                options={categoryOptions}
                value={categoryOptions.find((opt) => opt.value === product.categoryId)}
                onChange={(option) => handleCategoryChange(index, option)}
                placeholder="Без категории"
                isClearable
                menuPortalTarget={document.body}
                formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}
                closeMenuOnScroll={true}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleImport} disabled={!isReadyToImport || isProcessing}>
          {isProcessing ? 'Обработка...' : `Импортировать ${stagedProducts.length} продуктов`}
        </Button>
      </div>
    </Modal>
  );
};

export default ImportProductsModal;
