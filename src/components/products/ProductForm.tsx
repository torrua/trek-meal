// src/components/products/ProductForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Component,
  Scale,
  Flame,
  RefreshCw,
  BarChart3,
  Copy,
  Download,
  Save,
  FolderOpen,
  Check,
  Edit,
  TrendingUp,
  FileText,
} from 'lucide-react';
import useCategoryStore from '../../stores/useCategoryStore';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import { toast } from 'react-hot-toast';
import type { Product, ProductData, ProductPortion, Category } from '../../types';

interface ProductFormProps {
  product: Product | null;
  onSubmit: (data: ProductData) => void;
  onCancel: () => void;
}

// Define template type
interface PortionTemplate {
  id: string;
  name: string;
  portions: ProductPortion[];
}

const INITIAL_STATE: ProductData = {
  name: '',
  description: '',
  calories: 0,
  proteins: 0,
  fats: 0,
  carbs: 0,
  isPerishable: false,
  packaging: '',
  categoryId: null,
  portions: [{ name: 'Стандартная', weight: 0 }],
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const { categories } = useCategoryStore();
  const [formData, setFormData] = useState<ProductData>(INITIAL_STATE);
  const [templates, setTemplates] = useState<PortionTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedPortions, setSelectedPortions] = useState<Set<number>>(new Set());
  const [bulkEditValues, setBulkEditValues] = useState<{ name: string; weight: string }>({
    name: '',
    weight: '',
  });
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (product) {
      const { id: _id, ...data } = product;
      setFormData({
        ...INITIAL_STATE,
        ...data,
        portions: data.portions?.length ? data.portions : [{ name: 'Стандартная', weight: 0 }],
      });
    } else {
      setFormData(INITIAL_STATE);
    }

    // Load templates from localStorage
    const savedTemplates = localStorage.getItem('productPortionTemplates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (e) {
        console.error('Failed to parse templates', e);
      }
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? isChecked : value }));
  };

  const handleSelectChange = (name: keyof ProductData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePortionChange = (index: number, field: keyof ProductPortion, value: string) => {
    const newPortions = [...formData.portions];
    newPortions[index] = { ...newPortions[index], [field]: value };
    setFormData((prev) => ({ ...prev, portions: newPortions }));
  };

  const addPortion = () => {
    setFormData((prev) => ({ ...prev, portions: [...prev.portions, { name: '', weight: 0 }] }));
  };

  const removePortion = (index: number) => {
    if (formData.portions.length > 1) {
      setFormData((prev) => ({ ...prev, portions: prev.portions.filter((_, i) => i !== index) }));
      // Also remove from selected portions
      const newSelected = new Set(selectedPortions);
      newSelected.delete(index);
      setSelectedPortions(newSelected);
    }
  };

  // New function to add multiple portions at once
  const addMultiplePortions = (count: number) => {
    const newPortions = Array(count)
      .fill(null)
      .map((_, i) => ({
        name: `Порция ${formData.portions.length + i + 1}`,
        weight: 100 * (i + 1),
      }));
    setFormData((prev) => ({ ...prev, portions: [...prev.portions, ...newPortions] }));
  };

  // New function to clear all portions and add a default one
  const resetPortions = () => {
    setFormData((prev) => ({ ...prev, portions: [{ name: 'Стандартная', weight: 100 }] }));
    setSelectedPortions(new Set());
  };

  // New function to apply a template to all portions
  const applyTemplateToAll = (template: { name: string; weight: number }) => {
    const updatedPortions = formData.portions.map((portion) => ({
      ...portion,
      name: template.name,
      weight: template.weight,
    }));
    setFormData((prev) => ({ ...prev, portions: updatedPortions }));
  };

  // Function to calculate portion statistics
  const calculatePortionStats = () => {
    const portions = formData.portions;
    if (portions.length === 0) return { count: 0, totalWeight: 0, averageWeight: 0 };

    const totalWeight = portions.reduce((sum, portion) => sum + (Number(portion.weight) || 0), 0);
    const averageWeight = totalWeight / portions.length;

    return {
      count: portions.length,
      totalWeight: Math.round(totalWeight * 100) / 100,
      averageWeight: Math.round(averageWeight * 100) / 100,
    };
  };

  // Function to duplicate a portion
  const duplicatePortion = (index: number) => {
    const portionToDuplicate = formData.portions[index];
    const newPortion = {
      ...portionToDuplicate,
      name: `${portionToDuplicate.name} (копия)`,
    };
    const newPortions = [...formData.portions];
    newPortions.splice(index + 1, 0, newPortion);
    setFormData((prev) => ({ ...prev, portions: newPortions }));
  };

  // Function to sort portions by weight
  const sortPortionsByWeight = (ascending = true) => {
    const sortedPortions = [...formData.portions].sort((a, b) => {
      const weightA = Number(a.weight) || 0;
      const weightB = Number(b.weight) || 0;
      return ascending ? weightA - weightB : weightB - weightA;
    });
    setFormData((prev) => ({ ...prev, portions: sortedPortions }));
  };

  // Function to generate common portion patterns
  const generateCommonPortions = () => {
    const commonPatterns = [
      { name: 'Дегустация', weight: 10 },
      { name: 'Малая', weight: 50 },
      { name: 'Средняя', weight: 100 },
      { name: 'Большая', weight: 200 },
      { name: 'Порция', weight: 150 },
      { name: 'Грамм', weight: 100 },
      { name: 'Килограмм', weight: 1000 },
    ];

    setFormData((prev) => ({
      ...prev,
      portions: commonPatterns.map((pattern) => ({ ...pattern })),
    }));
  };

  // Function to save current portions as a template
  const saveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Пожалуйста, введите название шаблона');
      return;
    }

    const newTemplate: PortionTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      portions: [...formData.portions],
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('productPortionTemplates', JSON.stringify(updatedTemplates));
    setNewTemplateName('');
    toast.success('Шаблон сохранен');
  };

  // Function to load a template
  const loadTemplate = (template: PortionTemplate) => {
    setFormData((prev) => ({ ...prev, portions: [...template.portions] }));
    setSelectedPortions(new Set());
    toast.success(`Шаблон "${template.name}" загружен`);
  };

  // Function to delete a template
  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter((t) => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('productPortionTemplates', JSON.stringify(updatedTemplates));
    toast.success('Шаблон удален');
  };

  // Bulk editing functions
  const togglePortionSelection = (index: number) => {
    const newSelected = new Set(selectedPortions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPortions(newSelected);
  };

  const selectAllPortions = () => {
    const allIndices = new Set(formData.portions.map((_, index) => index));
    setSelectedPortions(allIndices);
  };

  const clearSelection = () => {
    setSelectedPortions(new Set());
  };

  const applyBulkEdit = () => {
    if (selectedPortions.size === 0) {
      toast.error('Пожалуйста, выберите порции для массового редактирования');
      return;
    }

    const newPortions = [...formData.portions];
    selectedPortions.forEach((index) => {
      if (bulkEditValues.name) {
        newPortions[index].name = bulkEditValues.name;
      }
      if (bulkEditValues.weight) {
        newPortions[index].weight = Number(bulkEditValues.weight);
      }
    });

    setFormData((prev) => ({ ...prev, portions: newPortions }));
    setBulkEditValues({ name: '', weight: '' });
    toast.success(`Обновлено ${selectedPortions.size} порций`);
  };

  const deleteSelectedPortions = () => {
    if (selectedPortions.size === 0) {
      toast.error('Пожалуйста, выберите порции для удаления');
      return;
    }

    if (formData.portions.length - selectedPortions.size < 1) {
      toast.error('Нельзя удалить все порции. Должна остаться хотя бы одна.');
      return;
    }

    const newPortions = formData.portions
      .filter((_, index) => !selectedPortions.has(index))
      .map((portion) => ({ ...portion }));

    setFormData((prev) => ({ ...prev, portions: newPortions }));
    setSelectedPortions(new Set());
    toast.success(`Удалено ${selectedPortions.size} порций`);
  };

  // Analytics functions
  const getWeightDistribution = () => {
    const portions = formData.portions;
    if (portions.length === 0) return [];

    const weights = portions.map((p) => Number(p.weight) || 0);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1; // Avoid division by zero

    return portions.map((portion, index) => {
      const weight = Number(portion.weight) || 0;
      const percentage = ((weight - min) / range) * 100;
      return {
        index,
        name: portion.name,
        weight,
        percentage,
        isSelected: selectedPortions.has(index),
      };
    });
  };

  // Export functions
  const exportPortionsToCSV = () => {
    const headers = ['Название', 'Вес (г)'];
    const rows = formData.portions.map((p) => [p.name, String(p.weight)]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `порции_${formData.name || 'продукт'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Порции экспортированы в CSV');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      formData.portions.some((p) => !String(p.weight).trim() || Number(p.weight) <= 0)
    ) {
      toast.error('Пожалуйста, заполните название и вес (больше нуля) для всех порций.');
      return;
    }
    onSubmit(formData);
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat: Category) => ({
      value: String(cat.id),
      label: cat.name,
    })),
  ];

  const portionStats = calculatePortionStats();
  const weightDistribution = getWeightDistribution();

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Component className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Основная информация
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Название продукта" required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                placeholder="Например, Гречневая крупа"
                className="text-base font-medium"
              />
            </FormField>

            <DropdownSelect
              label="Категория"
              icon={Component}
              options={categoryOptions}
              value={String(formData.categoryId || '')}
              onChange={(val) => typeof val === 'string' && handleSelectChange('categoryId', val)}
              placeholder="Выберите категорию"
            />
          </div>

          <FormField label="Описание">
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Краткое описание продукта, особенности приготовления..."
            />
          </FormField>
        </div>

        {/* Nutritional Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Пищевая ценность (на 100г)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="Калории (ккал)">
              <Input
                name="calories"
                type="number"
                value={formData.calories}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Белки (г)">
              <Input
                name="proteins"
                type="number"
                value={formData.proteins}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Жиры (г)">
              <Input
                name="fats"
                type="number"
                value={formData.fats}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
            <FormField label="Углеводы (г)">
              <Input
                name="carbs"
                type="number"
                value={formData.carbs}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormField>
          </div>
        </div>

        {/* Product Properties Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border notion-border-subtle">
            <div className="flex items-center gap-3">
              <input
                id="isPerishable"
                name="isPerishable"
                type="checkbox"
                checked={formData.isPerishable}
                onChange={handleChange}
                className="w-4 h-4 rounded border notion-border-subtle text-primary focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              />
              <label
                htmlFor="isPerishable"
                className="text-sm font-medium text-foreground cursor-pointer"
              >
                Скоропортящийся продукт
              </label>
            </div>
            <div className="text-xs text-muted-foreground">Требует особых условий хранения</div>
          </div>
        </div>

        {/* Portions Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-foreground tracking-tight">Порции</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                {showAnalytics ? 'Скрыть аналитику' : 'Показать аналитику'}
              </Button>
            </div>
          </div>

          {/* Portion Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center">
                  <Scale className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Всего порций</p>
                  <p className="text-lg font-semibold">{portionStats.count}</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Общий вес</p>
                  <p className="text-lg font-semibold">{portionStats.totalWeight} г</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Средний вес</p>
                  <p className="text-lg font-semibold">{portionStats.averageWeight} г</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Visualization */}
          {showAnalytics && (
            <div className="bg-card rounded-lg border border-border p-4 mb-4">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Аналитика порций
              </h4>

              {/* Weight Distribution Bar Chart */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Минимальный вес</span>
                  <span>Максимальный вес</span>
                </div>
                {weightDistribution.map((item) => (
                  <div key={item.index} className="flex items-center gap-3">
                    <div className="w-24 text-xs truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <div
                        className={`h-full rounded-md ${
                          item.isSelected
                            ? 'bg-primary'
                            : item.percentage > 70
                              ? 'bg-green-500'
                              : item.percentage > 30
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                    <div className="w-16 text-right text-xs">{item.weight} г</div>
                  </div>
                ))}
              </div>

              {/* Export Button */}
              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={exportPortionsToCSV}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Экспорт в CSV
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Selection Controls */}
          {formData.portions.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <Button type="button" variant="outline" size="sm" onClick={selectAllPortions}>
                Выделить все
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={selectedPortions.size === 0}
              >
                Снять выделение
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={deleteSelectedPortions}
                disabled={selectedPortions.size === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить выделенные ({selectedPortions.size})
              </Button>
            </div>
          )}

          {/* Bulk Edit Controls */}
          {selectedPortions.size > 0 && (
            <div className="bg-muted/30 rounded-xl border border-border p-4 mb-4">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Массовое редактирование ({selectedPortions.size} порций выделено)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="Название порции">
                  <Input
                    placeholder="Новое название для выделенных порций"
                    value={bulkEditValues.name}
                    onChange={(e) => setBulkEditValues({ ...bulkEditValues, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Вес (г)">
                  <Input
                    type="number"
                    placeholder="Новый вес для выделенных порций"
                    value={bulkEditValues.weight}
                    onChange={(e) =>
                      setBulkEditValues({ ...bulkEditValues, weight: e.target.value })
                    }
                    min="0"
                  />
                </FormField>
              </div>
              <div className="flex justify-end mt-3">
                <Button type="button" variant="primary" onClick={applyBulkEdit}>
                  Применить изменения
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {formData.portions.map((portion, index) => (
              <div
                key={index}
                className={`flex items-end gap-3 p-4 rounded-xl border border-border transition-all duration-200 ${
                  selectedPortions.has(index)
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                    : 'bg-muted/30'
                }`}
              >
                {/* Selection Checkbox */}
                <div className="flex items-center h-full">
                  <button
                    type="button"
                    onClick={() => togglePortionSelection(index)}
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedPortions.has(index)
                        ? 'bg-primary border-primary'
                        : 'border-border hover:border-foreground'
                    }`}
                  >
                    {selectedPortions.has(index) && <Check className="w-4 h-4 text-white" />}
                  </button>
                </div>

                <FormField label="Название порции" className="flex-1">
                  <Input
                    type="text"
                    placeholder="Например, 'Малая', 'Большая'"
                    value={portion.name}
                    onChange={(e) => handlePortionChange(index, 'name', e.target.value)}
                  />
                </FormField>
                <FormField label="Вес (г)" className="w-32 flex-shrink-0">
                  <Input
                    type="number"
                    placeholder="0"
                    value={portion.weight}
                    onChange={(e) => handlePortionChange(index, 'weight', e.target.value)}
                    required
                    min="0"
                  />
                </FormField>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicatePortion(index)}
                    className="text-muted-foreground hover:bg-muted/60"
                    title="Дублировать порцию"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePortion(index)}
                    disabled={formData.portions.length <= 1}
                    className="text-danger hover:bg-danger/10"
                    title="Удалить порцию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addPortion}
            className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить порцию
          </Button>

          {/* Template Management */}
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Управление шаблонами порций
            </h4>

            {/* Save Template */}
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Название шаблона"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={saveTemplate}
                disabled={!newTemplateName.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>

            {/* Load Templates */}
            {templates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                      title={`Загрузить шаблон: ${template.name}`}
                    >
                      {template.name}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-danger hover:bg-danger/10 h-8 w-8"
                      title="Удалить шаблон"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New bulk actions for portions */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMultiplePortions(3)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить 3 порции
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetPortions}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Сбросить порции
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={generateCommonPortions}>
              <Download className="w-4 h-4 mr-2" />
              Стандартные порции
            </Button>
          </div>

          {/* Sorting controls */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-muted-foreground self-center">Сортировка:</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => sortPortionsByWeight(true)}
            >
              По возрастанию веса
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => sortPortionsByWeight(false)}
            >
              По убыванию веса
            </Button>
          </div>

          {/* Portion templates */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Применить шаблон ко всем порциям:
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyTemplateToAll({ name: 'Малая', weight: 50 })}
              >
                Малая (50г)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyTemplateToAll({ name: 'Средняя', weight: 100 })}
              >
                Средняя (100г)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => applyTemplateToAll({ name: 'Большая', weight: 200 })}
              >
                Большая (200г)
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {product ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
