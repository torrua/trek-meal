// src/components/equipment/EquipmentDetail.tsx

import React, { useState } from 'react';
import { Info, Scale, User, Users, Tag, ExternalLink } from 'lucide-react';
import type { Equipment } from '../../types';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';

interface EquipmentDetailProps {
  equipment: Equipment | null;
  isEditing?: boolean;
  onSave?: (data: Partial<Equipment>) => void;
  onCancel?: () => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({
  equipment,
  isEditing = false,
  onSave,
  onCancel,
}) => {
  const { categories } = useEquipmentCategoryStore();
  const { participants } = useParticipantStore();

  const [formData, setFormData] = useState({
    name: equipment?.name || '',
    description: equipment?.description || '',
    weight: equipment?.weight || 0,
    type: equipment?.type || 'common',
    categoryId: equipment?.categoryId || null,
    ownerId: equipment?.ownerId || null,
    link: equipment?.link || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'categoryId') {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : null }));
    } else if (name === 'ownerId') {
      const ownerId = value ? Number(value) : null;
      const type = ownerId ? 'personal' : 'common';
      setFormData((prev) => ({ ...prev, ownerId, type }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  const category = categories.find((c) => c.id === equipment?.categoryId);
  const owner = participants.find((p) => p.id === equipment?.ownerId);

  if (!equipment && !isEditing) {
    return null;
  }

  return (
    <>
      {/* Basic Info Section */}
      <div className="gradient-basic-info rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Основная информация</h2>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Название</label>
            {isEditing ? (
              <FormField>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Название снаряжения"
                  className="text-base font-medium"
                />
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line">{equipment?.name || ''}</div>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Вес</label>
            {isEditing ? (
              <FormField>
                <Input
                  name="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Вес в граммах"
                  min="0"
                />
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span>{formatWeight(equipment?.weight || 0)}</span>
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Тип снаряжения</label>
            {isEditing ? (
              <FormField>
                <select
                  name="type"
                  value={formData.type}
                  onChange={(e) => handleSelectChange('type', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                  aria-label="Тип снаряжения"
                >
                  <option value="common">Общее</option>
                  <option value="personal">Личное</option>
                </select>
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                {equipment?.type === 'personal' ? (
                  <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                ) : (
                  <Users className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
                <span>{equipment?.type === 'personal' ? 'Личное' : 'Общее'}</span>
              </div>
            )}
          </div>

          {/* Owner */}
          {(isEditing || equipment?.ownerId) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Владелец</label>
              {isEditing ? (
                <FormField>
                  <select
                    name="ownerId"
                    value={formData.ownerId || ''}
                    onChange={(e) => handleSelectChange('ownerId', e.target.value)}
                    className="w-full h-10 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                    aria-label="Владелец снаряжения"
                  >
                    <option value="">Без владельца (общее)</option>
                    {participants.map((participant) => (
                      <option key={participant.id} value={participant.id}>
                        {participant.name}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : (
                owner && (
                  <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{owner.name}</span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Категория</label>
            {isEditing ? (
              <FormField>
                <select
                  name="categoryId"
                  value={formData.categoryId || ''}
                  onChange={(e) => handleSelectChange('categoryId', e.target.value)}
                  className="w-full h-10 rounded-lg border border-border bg-card px-4 py-2 text-sm"
                  aria-label="Категория снаряжения"
                >
                  <option value="">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              category && (
                <div className="view-mode-field view-mode-single-line flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>{category.name}</span>
                </div>
              )
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
            {isEditing ? (
              <FormField>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Описание снаряжения..."
                  rows={3}
                />
              </FormField>
            ) : (
              equipment?.description && (
                <div className="view-mode-field view-mode-multi-line">{equipment.description}</div>
              )
            )}
          </div>

          {/* Link */}
          {(isEditing || equipment?.link) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Ссылка</label>
              {isEditing ? (
                <FormField>
                  <Input
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://..."
                    type="url"
                  />
                </FormField>
              ) : (
                equipment?.link && (
                  <div className="view-mode-field view-mode-single-line">
                    <a
                      href={equipment.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Открыть ссылку
                    </a>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex items-center gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>
      )}
    </>
  );
};

export default EquipmentDetail;
