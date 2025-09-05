// src/pages/ProductsPage.tsx

import React, { useState, useRef } from 'react';
import { CirclePlus, Filter, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductsContent from '../components/products';
import Button from '../ui/Button';
import ImportProductsModal from '../components/products/ImportProductsModal';
import { ImportedJsonData } from '../types';

const ProductsPage: React.FC = () => {
  const [addHandler, setAddHandler] = useState<(() => void) | null>(null);
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const [fileContent, setFileContent] = useState<ImportedJsonData | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          // TODO: Добавить валидацию контента через Zod или подобное
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

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Продукты</h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setShowFilters((prev) => !prev)}
              title="Фильтр"
            >
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Импорт"
            >
              <UploadCloud className="w-4 h-4" />
            </Button>
            <Button variant="primary" onClick={addHandler || undefined}>
              <CirclePlus className="w-4 h-4 mr-2" />
              Добавить продукт
            </Button>
          </div>
        </div>
      </div>

      <ProductsContent setAddHandler={setAddHandler} showFilters={showFilters} />

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        fileContent={fileContent}
      />
    </div>
  );
};

export default ProductsPage;
