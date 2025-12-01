// src/pages/SettingsPage.tsx

import React, { useRef } from 'react';
import { Upload, Download, Database, LayoutTemplate, Search } from 'lucide-react';
import { exportDataToJson, importDataFromJson } from '../utils/backup';
import Button from '../ui/Button';
import CardViewSettings from '../components/settings/CardViewSettings';
import { useSettingsStore } from '../stores/useSettingsStore';

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SearchByCategoryToggle: React.FC = () => {
    const { searchByCategory, toggleSearchByCategory } = useSettingsStore();
    return (
      <div className="mt-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={searchByCategory}
            onChange={() => toggleSearchByCategory()}
            className="w-4 h-4"
          />
          <span className="text-sm text-foreground">Поиск продуктов по категориям</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          Если включено, поиск продуктов будет также находить продукты по совпадению названия
          категории.
        </p>
      </div>
    );
  };

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
    <div className="max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="lg:col-span-1 space-y-6">
          <header className="pb-6 border-b border-border">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Настройки</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Управление внешним видом и данными приложения.
            </p>
          </header>

          {/* Секция: Интерфейс (Новая секция) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Отображение карточек</h2>
                <p className="text-sm text-muted-foreground">
                  Настройте, какие данные показывать в компактном виде списков.
                </p>
              </div>
            </div>

            {/* Компонент настроек полей */}
            <CardViewSettings />

            {/* Поисковые настройки временно внутри интерфейса (перенесено ниже) */}
          </section>

          {/* Секция: Поиск */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Поиск</h2>
                <p className="text-sm text-muted-foreground">Общие настройки поведения поиска.</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-6">
                <SearchByCategoryToggle />
              </div>
            </div>
          </section>

          {/* Секция: Данные (Существующая секция) */}
          <section className="space-y-6 pt-10 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Резервное копирование</h2>
                <p className="text-sm text-muted-foreground">
                  Экспорт и импорт всех данных приложения.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="p-6">
                <h3 className="font-medium text-foreground mb-2">Полный экспорт данных</h3>
                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  Создайте полный снимок всех ваших данных: участники, походы, продукты, блюда,
                  снаряжение и настройки. Скачанный JSON-файл можно использовать для восстановления
                  данных на этом или другом устройстве.
                </p>
              </div>

              <div className="bg-muted/30 px-6 py-4 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                  title="Выберите JSON файл для импорта данных"
                />
                <Button variant="secondary" onClick={handleImportClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Импортировать
                </Button>
                <Button variant="primary" onClick={exportDataToJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Скачать резервную копию
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
