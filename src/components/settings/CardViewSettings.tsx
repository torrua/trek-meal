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
  Component,
  Soup,
  Utensils,
} from 'lucide-react';
import cn from 'classnames';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { CARD_FIELDS } from '../../config/cardFields';
import { EntityType, FieldConfig } from '../../types';
import Button from '../../ui/Button';
import './CardViewSettings.css';

interface FieldDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
}

const TAB_ICONS: Record<EntityType, React.ElementType> = {
  trips: MapPin,
  participants: Users,
  products: Component,
  dishes: Soup,
  meals: Utensils,
  'meal-types': Tag,
  equipment: Backpack,
};

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
  meals: Utensils,
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const Icon = FIELD_ICONS[field.id] || FIELD_ICONS.default;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center justify-between p-2 bg-card border border-border rounded-md mb-1.5',
        'group hover:border-primary/40 hover:shadow-sm',
        isDragging && 'shadow-lg ring-2 ring-primary/20 opacity-50'
      )}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
        zIndex: isDragging ? 1000 : 1,
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className={cn(
            'p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing',
            'touch-none flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity'
          )}
          title="Перетащить"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        <div
          className={cn('p-1 rounded bg-muted/50 flex-shrink-0', !field.visible && 'opacity-40')}
        >
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        <span
          className={cn(
            'text-sm transition-colors truncate',
            !field.visible && 'text-muted-foreground'
          )}
        >
          {label}
        </span>
      </div>

      <button
        onClick={onToggle}
        className={cn(
          'p-1.5 rounded transition-colors',
          field.visible
            ? 'text-primary bg-primary/10 hover:bg-primary/20'
            : 'text-muted-foreground bg-muted hover:bg-muted/80'
        )}
        title={field.visible ? 'Скрыть поле' : 'Показать поле'}
      >
        {field.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};

const CardViewSettings: React.FC = () => {
  const { cardViews, toggleFieldVisibility, reorderFields, resetToDefaults } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<EntityType>('trips');

  const tabs: { id: EntityType; label: string }[] = [
    { id: 'trips', label: 'Походы' },
    { id: 'participants', label: 'Участники' },
    { id: 'products', label: 'Продукты' },
    { id: 'dishes', label: 'Блюда' },
    { id: 'meals', label: 'Приёмы пищи' },
    { id: 'meal-types', label: 'Типы приёмов пищи' },
    { id: 'equipment', label: 'Снаряжение' },
  ];

  const currentFields = cardViews[activeTab] || [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = currentFields.findIndex((f: FieldConfig) => f.id === active.id);
      const newIndex = currentFields.findIndex((f: FieldConfig) => f.id === over.id);
      reorderFields(activeTab, arrayMove(currentFields, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-4">
      {/* Табы: активный - с текстом, остальные - только иконки */}
      <div className="flex flex-wrap gap-1.5 pb-3 border-b border-border">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm min-w-0'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground w-10 h-10 justify-center p-0'
              )}
              title={!isActive ? tab.label : undefined}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {isActive && <span className="truncate">{tab.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Компактный заголовок и контент */}
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <div className="flex items-start sm:items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-base font-medium text-foreground">Настройка полей</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Порядок и видимость в списках</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetToDefaults(activeTab)}
            className="h-8 px-2 text-xs flex-shrink-0"
            title="Сброс к значениям по умолчанию"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Сброс
          </Button>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={currentFields.map((f: FieldConfig) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full">
              {currentFields.map((field: FieldConfig) => {
                const def = CARD_FIELDS[activeTab]?.find((d: FieldDefinition) => d.id === field.id);
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
