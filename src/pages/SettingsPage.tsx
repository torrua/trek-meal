// src/components/settings/SettingsPage.tsx

import React, { useRef } from 'react';
import { Upload, Download, Database } from 'lucide-react';
import { exportDataToJson, importDataFromJson } from '../utils/backup';
import Button from '../ui/Button';

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importDataFromJson(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-foreground">Настройки</h2>
        <p className="text-sm text-muted-foreground mt-1">Управление данными приложения.</p>
      </header>
      <div className="bg-card border rounded-lg">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 text-primary p-3 rounded-lg flex-shrink-0">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Полное резервное копирование
              </h3>
              <p className="text-muted-foreground mt-1">
                Создайте полный снимок всех данных приложения: участники, походы, продукты, блюда,
                категории продуктов, снаряжение, категории снаряжения, типы приёмов пищи и настройки
                темы. Резервная копия содержит метаданные и статистику для полного восстановления.
              </p>
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium">Включает:</span> все данные + метаданные + статистика
                записей
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted px-6 py-4 border-t flex flex-col sm:flex-row justify-end items-center gap-3">
          <Button variant="secondary" onClick={handleImportClick} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" />
            Импортировать из файла
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <Button variant="primary" onClick={exportDataToJson} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Создать полную резервную копию
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
