// src/components/meal-types/MealTypeDetail.tsx

import React, { useState } from 'react';
import { Info, Edit, Save } from 'lucide-react';
import type { MealType } from '../../types';
import Button from '../../ui/Button';
import MealTypeForm from './MealTypeForm';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import useMealTypesStore from '../../stores/useMealTypesStore';
import { toast } from 'react-hot-toast';

interface MealTypeDetailProps {
  mealType: MealType | null;
  onEdit?: () => void;
  editTrigger?: number;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
  onStartEdit?: () => void;
  onFinishEdit?: () => void;
  editSubmitTrigger?: number;
  editCancelTrigger?: number;
}

interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
  actionButton?: React.ReactNode;
  summaryContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  className?: string;
  disableToggle?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id: _id,
  title,
  icon,
  children,
  isOpen,
  onToggle: _onToggle,
  actionButton,
  summaryContent,
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
  className,
  disableToggle = false,
}) => {
  const defaultShadow = 'shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]';

  return (
    <div
      className={`${className || 'border border-border'} ${defaultShadow} rounded-xl relative transform`}
    >
      <div
        className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} rounded-xl absolute inset-0`}
      ></div>
      <div className="relative">
        <div
          className="flex items-center justify-between gap-3 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => {
            // Don't toggle section when disableToggle is true
            if (!disableToggle) {
              _onToggle(_id);
            }
          }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              {icon}
            </div>
            <h2 className="text-lg font-semibold truncate">{title}</h2>
            {summaryContent && <div className="ml-2 flex-shrink-0">{summaryContent}</div>}
          </div>
          <div className="flex items-center gap-2 min-w-[200px] justify-end">
            {actionButton}
            {headerContent}
          </div>
        </div>
        {isOpen && <div className="p-6 pt-0 pb-8">{children}</div>}
      </div>
    </div>
  );
};

const MealTypeDetail: React.FC<MealTypeDetailProps> = ({
  mealType,
  onEdit: _onEdit,
  editTrigger = 0,
  openSections,
  onToggleSection,
  onStartEdit,
  onFinishEdit,
  editSubmitTrigger = 0,
  editCancelTrigger = 0,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateMealType, addMealType } = useMealTypesStore();

  React.useEffect(() => {
    if (editTrigger > 0) {
      setIsEditing(true);
      setIsInlineEditing(true);
      setEditName('');
      setEditDescription('');
      onStartEdit?.();
    }
  }, [editTrigger, onStartEdit]); // isEditing не нужен - это состояние которое мы устанавливаем

  React.useEffect(() => {
    if (editSubmitTrigger > 0) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  }, [editSubmitTrigger, onFinishEdit]);

  React.useEffect(() => {
    if (editCancelTrigger > 0) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  }, [editCancelTrigger, onFinishEdit]);

  const handleInlineEdit = () => {
    if (mealType) {
      // Ensure the basic-info section is open when entering edit mode
      if (!openSections.includes('basic-info')) {
        onToggleSection('basic-info');
      }
      setEditName(mealType.name);
      setEditDescription(mealType.description || '');
      setIsInlineEditing(true);
    }
  };

  const handleInlineSave = async () => {
    try {
      setIsSubmitting(true);

      if (mealType) {
        // Редактирование существующего типа
        await updateMealType(mealType.id, editName);
        toast.success('Тип приёма пищи обновлён');
      } else {
        // Создание нового типа
        await addMealType(editName);
        toast.success('Тип приёма пищи создан');
      }

      setIsInlineEditing(false);

      // Если это создание нового типа, сбрасываем состояние создания
      if (!mealType) {
        setIsEditing(false);
        onFinishEdit?.();
      }
    } catch (error) {
      console.error('Error saving meal type:', error);
      toast.error('Ошибка при сохранении типа приёма пищи');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInlineCancel = () => {
    setIsInlineEditing(false);
    // Если это создание нового типа, сбрасываем и состояние создания
    if (!mealType) {
      setIsEditing(false);
      onFinishEdit?.();
    }
  };

  // Для нового типа показываем форму создания в режиме просмотра (не редактирования)
  if (!mealType) {
    // Показываем форму для создания нового типа в режиме просмотра
    return (
      <div className="pt-2">
        <div className="space-y-4">
          {/* Basic Info Section */}
          <CollapsibleSection
            id="basic-info"
            title="Основная информация"
            icon={<Info className="w-4 h-4 text-primary" />}
            isOpen={openSections.includes('basic-info')}
            onToggle={onToggleSection}
            gradientFrom="from-blue-500/5"
            gradientVia="via-purple-500/5"
            gradientTo="to-pink-500/5"
            actionButton={
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleInlineCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleInlineSave}
                  disabled={isSubmitting || !editName.trim()}
                  icon={isSubmitting ? undefined : Save}
                  size="icon"
                >
                  {isSubmitting ? 'Сохранение...' : ''}
                </Button>
              </div>
            }
            disableToggle={true}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Название</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Введите название типа"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Описание</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Введите описание (необязательно)"
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>
    );
  }

  if (isEditing && mealType) {
    return (
      <div className="h-full">
        <MealTypeForm
          mealType={mealType}
          onSubmit={(_data) => {
            // Здесь будет логика сохранения
            setIsEditing(false);
            onFinishEdit?.();
          }}
          onCancel={() => {
            setIsEditing(false);
            onFinishEdit?.();
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="space-y-4">
        {/* Basic Info Section */}
        <CollapsibleSection
          id="basic-info"
          title="Основная информация"
          icon={<Info className="w-4 h-4 text-primary" />}
          isOpen={openSections.includes('basic-info')}
          onToggle={onToggleSection}
          gradientFrom="from-purple-500/5"
          gradientVia="via-yellow-500/5"
          gradientTo="to-pink-500/5"
          actionButton={
            !isInlineEditing && mealType ? (
              <Button
                type="button"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInlineEdit();
                }}
                icon={Edit}
                size="icon"
              >
                {/* Пусто - только иконка */}
              </Button>
            ) : isInlineEditing ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleInlineCancel}
                  disabled={isSubmitting}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleInlineSave}
                  disabled={isSubmitting || !editName.trim()}
                  icon={isSubmitting ? undefined : Save}
                  size="icon"
                >
                  {isSubmitting ? 'Сохранение...' : ''}
                </Button>
              </div>
            ) : null
          }
          disableToggle={isInlineEditing}
        >
          <div className="space-y-4">
            {isInlineEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Название</label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Введите название типа"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Описание</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Введите описание (необязательно)"
                    disabled={isSubmitting}
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Название</label>
                  <div className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground">
                    {mealType?.name || ''}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Описание</label>
                  <div className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground whitespace-pre-wrap min-h-[80px]">
                    {mealType?.description || 'Нет описания'}
                  </div>
                </div>
              </>
            )}
          </div>
        </CollapsibleSection>

        {/* Usage Section - только для существующих типов */}
        {/* Убрали секцию использования по запросу */}
      </div>
    </div>
  );
};

export default MealTypeDetail;
