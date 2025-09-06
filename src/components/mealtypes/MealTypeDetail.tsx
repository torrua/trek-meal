// src/components/mealtypes/MealTypeDetail.tsx

import React from 'react';
import { Utensils, Edit, Info } from 'lucide-react';
import type { MealType } from '../../stores/useMealTypesStore';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';

interface MealTypeDetailProps {
  mealType: MealType | null;
  onEdit: () => void;
}

const MealTypeDetail: React.FC<MealTypeDetailProps> = ({ mealType, onEdit }) => {
  const [openSections, setOpenSections] = React.useState<string[]>(['info']);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  if (!mealType) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Выберите прием пищи</h3>
          <p className="text-muted-foreground">Кликните на карточку для просмотра информации.</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 'info',
      title: 'Информация',
      icon: Info,
      content: (
        <p className="text-muted-foreground">
          Этот прием пищи будет доступен для выбора при планировании раскладки в походах.
        </p>
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
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
            <Utensils className="w-5 h-5 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{mealType.name}</h2>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>
    </DetailPane>
  );
};

export default MealTypeDetail;
