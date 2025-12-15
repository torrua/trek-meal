// src/components/equipment/EquipmentCategoryDetail.tsx

import React, { useState } from 'react';
import { Info, Edit, Save } from 'lucide-react';
import type { EquipmentCategory } from '../../types';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import FormField from '../../ui/FormField';
import CollapsibleSection from '../../ui/CollapsibleSection';
import { toast } from 'react-hot-toast';

interface EquipmentCategoryDetailProps {
  category: EquipmentCategory | null;
  openSections?: string[];
  onToggleSection?: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
}

const EquipmentCategoryDetail: React.FC<EquipmentCategoryDetailProps> = ({
  category,
  openSections = ['basic-info'],
  onToggleSection,
  onStartEdit,
  onFinishEdit,
}) => {
  const { updateCategory } = useEquipmentCategoryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (category && formData.name.trim()) {
      updateCategory(category.id, formData);
      toast.success('Категория снаряжения обновлена');
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleCancel = () => {
    if (category) {
      const { id: _id, ...data } = category;
      setFormData({
        name: data.name,
        description: data.description || '',
      });
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  const handleStartEdit = () => {
    if (category) {
      setIsEditing(true);
      onStartEdit?.();
    }
  };

  const handleToggleSection = (sectionId: string) => {
    onToggleSection?.(sectionId);
  };

  if (!category && !isEditing) {
    return null;
  }

  return (
    <>
      {/* Basic Info Section */}
      <CollapsibleSection
        id="info"
        title="Основная информация"
        icon={<Info className="w-4 h-4 text-primary" />}
        isOpen={openSections.includes('info')}
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Название</label>
            {isEditing ? (
              <FormField>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Название категории"
                  className="text-base font-medium"
                />
              </FormField>
            ) : (
              <div className="view-mode-field view-mode-single-line">{category?.name || ''}</div>
            )}
          </div>

          {/* Description */}
          {(isEditing || category?.description) && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
              {isEditing ? (
                <FormField>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Описание категории (необязательно)"
                    rows={3}
                  />
                </FormField>
              ) : (
                <div className="view-mode-field view-mode-multi-line">{category?.description}</div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>
    </>
  );
};

export default EquipmentCategoryDetail;
