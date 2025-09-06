// src/components/equipment/EquipmentCategoryDetail.tsx

import React, { useState } from 'react';
import { Edit, Backpack, Tag, Plus } from 'lucide-react';
import useEquipmentStore from '../../stores/useEquipmentStore';
import type { EquipmentCategory } from '../../types';
import Button from '../../ui/Button';
import DetailPane from '../../ui/DetailPane';
import EquipmentListItem from './EquipmentListItem';

interface EquipmentCategoryDetailProps {
  category: EquipmentCategory | null;
  onEdit: () => void;
  onAddEquipment?: () => void;
}

const EquipmentCategoryDetail: React.FC<EquipmentCategoryDetailProps> = ({
  category,
  onEdit,
  onAddEquipment,
}) => {
  const { equipment } = useEquipmentStore();
  const [openSections, setOpenSections] = useState<string[]>(['equipment']);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  if (!category) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Выберите категорию</h3>
          <p className="text-muted-foreground">
            Кликните на карточку для просмотра подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const categoryEquipment = equipment.filter((e) => e.categoryId === category.id);

  const sections = [
    {
      id: 'equipment',
      title: 'Снаряжение',
      icon: Backpack,
      actionButton: onAddEquipment && (
        <Button size="sm" variant="ghost" onClick={onAddEquipment} title="Добавить снаряжение">
          <Plus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {categoryEquipment.length > 0 ? (
            categoryEquipment.map((equipmentItem) => (
              <EquipmentListItem
                key={equipmentItem.id}
                equipment={equipmentItem}
                borderColor={category.color}
                onView={() => console.log('Navigate to equipment', equipmentItem.id)}
                onEdit={() => console.log('Edit equipment', equipmentItem.id)}
                onDelete={() => console.log('Delete equipment', equipmentItem.id)}
              />
            ))
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">
              В этой категории пока нет снаряжения
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <DetailPane
      sections={sections}
      openSections={openSections}
      onToggleSection={handleToggleSection}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-muted">
            <span>{category.emoji}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{category.name}</h2>
            <p className="text-muted-foreground">{categoryEquipment.length} снаряжения</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default EquipmentCategoryDetail;
