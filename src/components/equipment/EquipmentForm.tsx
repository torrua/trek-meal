// src/components/equipment/EquipmentForm.tsx

import React, { useState, useEffect } from 'react';
import { Tag, Scale, User, Users, Backpack, ExternalLink } from 'lucide-react';
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
      icon: () => <span className="text-lg">{cat.emoji}</span>,
    })),
  ];

  const ownerOptions = [
    { value: '', label: 'Общее снаряжение (без владельца)' },
    ...participants.map((participant: Participant) => ({
      value: String(participant.id),
      label: participant.name,
    })),
  ];

  const typeOptions = [
    {
      value: 'personal',
      label: 'Личное',
      icon: () => <User className="w-4 h-4" />,
    },
    {
      value: 'common',
      label: 'Общее',
      icon: () => <Users className="w-4 h-4" />,
    },
  ];

  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      {/* Title - full width */}
      <Input
        label="Название *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        autoFocus
        placeholder="Например: Палатка MSR Hubba Hubba"
      />

      {/* Owner - second line, full width */}
      <DropdownSelect
        label="Владелец"
        icon={User}
        value={String(formData.ownerId || '')}
        onChange={(value) => handleSelectChange('ownerId', value)}
        options={ownerOptions}
      />

      {/* Category + Link - third line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DropdownSelect
          label="Категория"
          icon={Tag}
          value={String(formData.categoryId || '')}
          onChange={(value) => handleSelectChange('categoryId', value)}
          options={categoryOptions}
        />
        <Input
          label="Ссылка"
          name="link"
          type="url"
          value={formData.link || ''}
          onChange={handleChange}
          placeholder="https://example.com/product"
          icon={ExternalLink}
        />
      </div>

      {/* Description - fourth line, full width */}
      <Textarea
        label="Описание"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
        placeholder="Подробное описание снаряжения, особенности, характеристики..."
      />

      {/* Weight + Type - fifth line */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Вес *
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              min="1"
              step="1"
              placeholder="Вес в граммах"
              className="pl-10"
            />
          </div>
          {formData.weight > 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatWeight(formData.weight)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Тип снаряжения *
          </label>
          <div className="flex gap-3">
            {typeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors flex-1 ${
                  formData.type === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={option.value}
                  checked={formData.type === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 w-full">
                  <option.icon />
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Quick weight suggestions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Быстрый выбор веса
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '50г', value: 50 },
            { label: '100г', value: 100 },
            { label: '200г', value: 200 },
            { label: '500г', value: 500 },
            { label: '1кг', value: 1000 },
            { label: '2кг', value: 2000 },
            { label: '5кг', value: 5000 },
          ].map((weight) => (
            <button
              key={weight.value}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, weight: weight.value }))}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                formData.weight === weight.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {weight.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          <Backpack className="w-4 h-4 mr-2" />
          {equipment ? 'Обновить снаряжение' : 'Добавить снаряжение'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;
