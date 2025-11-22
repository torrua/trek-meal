// src/components/settings/CardViewSettings.tsx
import React, { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Flame,
  Beef,
  Droplet,
  Wheat,
  Weight,
  Hash,
  Calendar,
  MapPin,
  Users,
  Backpack,
  Tag,
  Info,
} from 'lucide-react';
import cn from 'classnames';
import { useSettingsStore, FieldConfig } from '../../stores/useSettingsStore';
import { CARD_FIELDS, EntityType } from '../../config/cardFields';
import Button from '../../ui/Button';

// Маппинг ID поля к иконке
const FIELD_ICONS: Record<string, React.ElementType> = {
  calories: Flame,
  proteins: Beef,
  fats: Droplet,
  carbs: Wheat,
  weight: Weight,
  items: Hash,
  dates: Calendar,
  destination: MapPin,
  participants: Users,
  type: Info,
  trips: MapPin,
  equipment: Backpack,
  default: Tag,
};

const SortableFieldItem = ({
  field,
  label,
  onToggle,
}: {
  field: FieldConfig;
  label: string;
  onToggle: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = FIELD_ICONS[field.id] || FIELD_ICONS.default;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-card border border-border rounded-lg mb-2 group hover:border-primary/40 transition-colors"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
          title="Перетащить"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-md bg-muted/50', !field.visible && 'opacity-50')}>
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span
            className={cn(
              'text-sm font-medium transition-colors',
              !field.visible && 'text-muted-foreground line-through decoration-border'
            )}
          >
            {label}
          </span>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={cn(
          'p-2 rounded-md transition-colors',
          field.visible
            ? 'text-primary bg-primary/10 hover:bg-primary/20'
            : 'text-muted-foreground bg-muted hover:bg-muted/80'
        )}
        title={field.visible ? 'Скрыть поле' : 'Показать поле'}
      >
        {field.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
    </div>
  );
};

const CardViewSettings: React.FC = () => {
  const { cardViews, toggleFieldVisibility, reorderFields, resetToDefaults } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<EntityType>('products');

  const tabs: { id: EntityType; label: string }[] = [
    { id: 'products', label: 'Продукты' },
    { id: 'dishes', label: 'Блюда' },
    { id: 'meals', label: 'Приёмы пищи' },
    { id: 'equipment', label: 'Снаряжение' },
    { id: 'trips', label: 'Походы' },
    { id: 'participants', label: 'Участники' },
  ];

  const currentFields = cardViews[activeTab] || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentFields.findIndex((f) => f.id === active.id);
      const newIndex = currentFields.findIndex((f) => f.id === over.id);
      reorderFields(activeTab, arrayMove(currentFields, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 pb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-muted/30 rounded-xl p-4 sm:p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Настройка компактного вида</h3>
            <p className="text-sm text-muted-foreground">Порядок и видимость полей в списках.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetToDefaults(activeTab)}
            title="Сброс к значениям по умолчанию"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Сброс
          </Button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={currentFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="max-w-xl space-y-2">
              {currentFields.map((field) => {
                const def = CARD_FIELDS[activeTab]?.find((d) => d.id === field.id);
                if (!def) return null;

                return (
                  <SortableFieldItem
                    key={field.id}
                    field={field}
                    label={def.label}
                    onToggle={() => toggleFieldVisibility(activeTab, field.id)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default CardViewSettings;
