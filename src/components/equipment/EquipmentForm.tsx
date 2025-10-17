// src/components/equipment/EquipmentForm.tsx

import React, { useState, useEffect } from 'react';
import { Tag, Scale, User, Users, Backpack, ExternalLink, Info } from 'lucide-react';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import { toast } from 'react-hot-toast';
import type {
  Equipment,
  EquipmentData,
  EquipmentCategory,
  EquipmentType,
  Participant,
} from '../../types';
import Input from '../../ui/Input';
import DropdownSelect from '../../ui/DropdownSelect';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';

interface EquipmentFormProps {
  equipment: Equipment | null;
  onSubmit: (data: EquipmentData) => void;
  onCancel: () => void;
}

const INITIAL_STATE: EquipmentData = {
  name: '',
  description: '',
  weight: 0,
  type: 'common',
  categoryId: null,
  ownerId: null,
  link: '',
};

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, onSubmit, onCancel }) => {
  const { categories } = useEquipmentCategoryStore();
  const { participants } = useParticipantStore();
  const [formData, setFormData] = useState<EquipmentData>(INITIAL_STATE);

  useEffect(() => {
    if (equipment) {
      const { id: _id, ...data } = equipment;
      setFormData({ ...INITIAL_STATE, ...data });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [equipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSelectChange = (name: keyof EquipmentData, value: string) => {
    if (name === 'categoryId') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
    } else if (name === 'ownerId') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value as EquipmentType }));
    }
  };

  const handleWeightQuickSelect = (weight: number) => {
    setFormData((prev) => ({ ...prev, weight }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Пожалуйста, введите название снаряжения.');
      return;
    }

    if (formData.weight <= 0) {
      toast.error('Вес должен быть больше нуля.');
      return;
    }

    onSubmit(formData);
  };

  const categoryOptions = [
    { value: '', label: 'Без категории' },
    ...categories.map((cat: EquipmentCategory) => ({
      value: String(cat.id),
      label: cat.name,
    })),
  ];

  const ownerOptions = [
    { value: '', label: 'Общее снаряжение (без владельца)' },
    ...participants.map((participant: Participant) => ({
      value: String(participant.id),
      label: participant.name,
    })),
  ];

  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  const weightPresets = [
    { label: '50г', value: 50 },
    { label: '100г', value: 100 },
    { label: '200г', value: 200 },
    { label: '500г', value: 500 },
    { label: '1кг', value: 1000 },
    { label: '2кг', value: 2000 },
    { label: '5кг', value: 5000 },
  ];

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Backpack className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Основная информация
            </h3>
          </div>

          <Input
            label="Название снаряжения"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoFocus
            placeholder="Например: Палатка MSR Hubba Hubba"
            className="text-base font-medium"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DropdownSelect
              label="Категория"
              icon={Tag}
              value={String(formData.categoryId || '')}
              onChange={(val) => typeof val === 'string' && handleSelectChange('categoryId', val)}
              options={categoryOptions}
            />

            <Input
              label="Ссылка на товар"
              name="link"
              type="url"
              value={formData.link || ''}
              onChange={handleChange}
              placeholder="https://example.com/product"
              icon={ExternalLink}
            />
          </div>

          <Textarea
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Подробное описание снаряжения, особенности, характеристики..."
          />
        </div>

        {/* Weight Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Вес и характеристики
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField label="Вес (граммы)" required>
                <Input
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  placeholder="Введите вес в граммах"
                  icon={Scale}
                />
              </FormField>

              {formData.weight > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg border notion-border-subtle">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4" />
                    <span>
                      Примерный вес:{' '}
                      <strong className="text-foreground">{formatWeight(formData.weight)}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground tracking-tight">
                Быстрый выбор веса
              </label>
              <div className="grid grid-cols-4 gap-2">
                {weightPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleWeightQuickSelect(preset.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 border notion-focus-ring ${
                      formData.weight === preset.value
                        ? 'bg-primary text-primary-foreground border-primary notion-shadow-sm'
                        : 'bg-muted/30 text-foreground border-notion-border-subtle hover:bg-muted/50 hover:notion-shadow-sm'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Type and Owner Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Тип и владелец</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground tracking-tight">
                Тип снаряжения
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectChange('type', 'personal')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 notion-focus-ring ${
                    formData.type === 'personal'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-notion-border-subtle hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Личное</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectChange('type', 'common')}
                  className={`flex items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-200 notion-focus-ring ${
                    formData.type === 'common'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-notion-border-subtle hover:bg-muted/30 text-foreground'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Общее</span>
                </button>
              </div>
            </div>

            <DropdownSelect
              label="Владелец"
              icon={User}
              value={String(formData.ownerId || '')}
              onChange={(val) => typeof val === 'string' && handleSelectChange('ownerId', val)}
              options={ownerOptions}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            <Backpack className="w-4 h-4 mr-2" />
            {equipment ? 'Обновить снаряжение' : 'Добавить снаряжение'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EquipmentForm;
