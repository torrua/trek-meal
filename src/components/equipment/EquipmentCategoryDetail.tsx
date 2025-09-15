// src/components/equipment/EquipmentCategoryDetail.tsx

import React, { useState } from 'react';
import { Edit, Backpack, Tag, Plus } from 'lucide-react';
import useEquipmentStore from '../../stores/useEquipmentStore';
import type { EquipmentCategory } from '../../types';
import Button from '../../ui/Button';
import DetailPane from '../../ui/DetailPane';
import EntityListItem from '../../ui/EntityListItem';
import { equipmentEntityConfig } from '../../config/entityConfig';
import { useNavigate } from 'react-router-dom';
import DynamicIcon from '../../ui/DynamicIcon';

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
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(['equipment']);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const formatWeight = (weight: number) => {
    if (weight < 1000) return `${weight} г`;
    return `${(weight / 1000).toFixed(1)} кг`;
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
      title: `Снаряжение (${categoryEquipment.length})`,
      icon: Backpack,
      actionButton: onAddEquipment && (
        <Button size="sm" variant="ghost" onClick={onAddEquipment} title="Добавить снаряжение">
          <Plus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {categoryEquipment.length > 0 ? (
            categoryEquipment.map((equipmentItem) => {
              const listItemConfig = equipmentEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => navigate(`/equipment?selectedId=${equipmentItem.id}`),
              });

              return (
                <EntityListItem
                  key={equipmentItem.id}
                  title={listItemConfig.title(equipmentItem)}
                  icon={equipmentEntityConfig.getIcon(equipmentItem)}
                  borderColor={equipmentEntityConfig.getBorderColor(equipmentItem, { category })}
                  details={listItemConfig.details?.(equipmentItem, {
                    formattedWeight: formatWeight(equipmentItem.weight),
                  })}
                  menuItems={actions}
                  onClick={() => navigate(`/equipment?selectedId=${equipmentItem.id}`)}
                />
              );
            })
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
          <div className="w-10 h-10 rounded-md flex items-center justify-center text-foreground bg-muted">
            <DynamicIcon name={category.iconName} className="w-5 h-5" />
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
