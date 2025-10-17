// src/components/equipment/EquipmentCategoryForm.tsx

import React, { useState } from 'react';
import { Palette, Backpack } from 'lucide-react';
import type { EquipmentCategoryData } from '../../types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import DynamicIcon from '../../ui/DynamicIcon';
import FormField from '../../ui/FormField';

interface EquipmentCategoryFormProps {
  category: EquipmentCategoryData | null;
  onSubmit: (data: EquipmentCategoryData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];

const EquipmentCategoryForm: React.FC<EquipmentCategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#8b5cf6');
  const [iconName, setIconName] = useState(category?.iconName || 'Backpack');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color, iconName });
    }
  };

  return (
    <div className="space-y-8">
      {/* Preview Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 tracking-tight">
          Предварительный просмотр
        </label>
        <div
          className="p-6 rounded-2xl border-2 bg-card transition-all duration-200"
          style={{ borderColor: color }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white notion-shadow-sm"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={iconName} className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-lg tracking-tight truncate">
                {name || 'Название категории'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Backpack className="w-4 h-4" />
                <span>0 снаряжения</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Icon Section */}
        <div className="space-y-6">
          <FormField label="Название категории" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Например, Палатки и тенты"
              className="text-base"
            />
          </FormField>

          <FormField label="Иконка (Lucide)">
            <Input
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              placeholder="Например, Tent"
              className="text-center font-mono text-sm"
            />
          </FormField>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground tracking-tight">
            Цвет категории
          </label>

          {/* Preset Colors Grid */}
          <div className="grid grid-cols-8 gap-3">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                className={`aspect-square rounded-xl transition-all duration-200 hover:scale-110 notion-focus-ring ${
                  color === presetColor
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 notion-shadow'
                    : 'hover:notion-shadow-sm'
                }`}
                style={{ backgroundColor: presetColor }}
                onClick={() => setColor(presetColor)}
                title={presetColor}
                aria-label={`Выбрать цвет ${presetColor}`}
              />
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border notion-border-subtle">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Свой цвет:</span>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border notion-border-subtle cursor-pointer notion-focus-ring"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border notion-border-subtle rounded-lg notion-focus-ring font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            <Backpack className="w-4 h-4 mr-2" />
            {category ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentCategoryForm;
