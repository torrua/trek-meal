// src/pages/TypesAndCategoriesPage.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Backpack, Utensils, Component } from 'lucide-react';
import TabNavigation, { TabItem } from '../ui/TabNavigation';
import useCategoryStore from '../stores/useCategoryStore';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import useMealTypesStore from '../stores/useMealTypesStore';

// Import existing page content components (we'll extract the main content from existing pages)
import CategoriesPageContent from './../components/categories/CategoriesPageContent';
import EquipmentCategoriesPageContent from './../components/equipment/EquipmentCategoriesPageContent';
import MealTypesPageContent from './../components/mealtypes/MealTypesPageContent';

const TypesAndCategoriesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('product-categories');

  // Get stores for counts
  const { categories: productCategories } = useCategoryStore();
  const { categories: equipmentCategories } = useEquipmentCategoryStore();
  const { mealTypes } = useMealTypesStore();

  // Initialize active tab from URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['product-categories', 'equipment-categories', 'meal-types'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Define tabs with counts
  const tabs: TabItem[] = useMemo(
    () => [
      {
        id: 'product-categories',
        label: 'Категории продуктов',
        icon: Component,
        count: productCategories.length,
      },
      {
        id: 'equipment-categories',
        label: 'Категории снаряжения',
        icon: Backpack,
        count: equipmentCategories.length,
      },
      {
        id: 'meal-types',
        label: 'Приемы пищи',
        icon: Utensils,
        count: mealTypes.length,
      },
    ],
    [productCategories.length, equipmentCategories.length, mealTypes.length]
  );

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      setSearchParams({ tab: tabId });
    },
    [setSearchParams]
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product-categories':
        return <CategoriesPageContent />;
      case 'equipment-categories':
        return <EquipmentCategoriesPageContent />;
      case 'meal-types':
        return <MealTypesPageContent />;
      default:
        return <CategoriesPageContent />;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Типы и категории</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Управление категориями продуктов, снаряжения и типами приемов пищи
        </p>

        {/* Tab Navigation */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          className="mb-6"
        />
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">{renderTabContent()}</div>
    </div>
  );
};

export default TypesAndCategoriesPage;
