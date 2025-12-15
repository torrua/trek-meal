// src/components/equipment/EquipmentDetail.tsx

import React, { useState } from 'react';
import { Info, Scale, User, Users, Tag, ExternalLink, Edit, Save } from 'lucide-react';
import type { Equipment } from '../../types';
import useEquipmentStore from '../../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import CollapsibleSection from '../../ui/CollapsibleSection';
import { toast } from 'react-hot-toast';

interface EquipmentDetailProps {
  equipment: Equipment | null;
  openSections?: string[];
  onToggleSection?: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
}

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({
  equipment,
  openSections = ['basic-info'],
  onToggleSection,
  onStartEdit,
  onFinishEdit,
}) => {
  const { categories } = useEquipmentCategoryStore();
  const { participants } = useParticipantStore();
  const { updateEquipment } = useEquipmentStore();

  const [isEditing, setIsEditing] = useState(false);
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
    if (equipment && formData.name.trim()) {
      updateEquipment(equipment.id, formData);
      toast.success('Снаряжение обновлено');
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleCancel = () => {
    if (equipment) {
      const { id: _id, ...data } = equipment;
      setFormData({
        name: data.name,
        description: data.description,
        weight: data.weight,
        type: data.type,
        categoryId: data.categoryId,
        ownerId: data.ownerId,
        link: data.link || '',
      });
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleStartEdit = () => {
    if (equipment) {
      setIsEditing(true);
      onStartEdit?.();
    }
  };

  const handleToggleSection = (sectionId: string) => {
    onToggleSection?.(sectionId);
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
      <CollapsibleSection
        id="basic-info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('basic-info')}
        onToggle={handleToggleSection}
        actionButton={
          isEditing ? (
            <div className="flex items-center gap-2 min-w-[280px] justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                Отмена
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                icon={Save}
                size="icon"
              >
                {/* Empty - only icon */}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit();
              }}
              icon={Edit}
              size="icon"
            >
              {/* Empty - only icon */}
            </Button>
          )
        }
        gradientFrom="gradient-basic-info"
        gradientVia=""
        gradientTo=""
      >
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
      </CollapsibleSection>
    </>
  );
};

export default EquipmentDetail;
