// src/components/trips/TripDetail.tsx

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Users,
  Calendar,
  Info,
  Edit,
  BarChart,
  Sun,
  Utensils,
  Gauge,
  UserRoundPlus,
  HandPlatter,
  MapPin,
  FileText,
  Save,
  X,
} from 'lucide-react';
import type { Trip, Participant, TripData } from '../../types';
import { formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import useParticipantStore from '../../stores/useParticipantStore';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import { calculateTripSummary } from '../../utils';
import { DIFFICULTY_CONFIG, TRIP_DIFFICULTY_OPTIONS } from '../../constants/trips';
import ConfirmModal from '../../ui/ConfirmModal';
import useTripStore from '../../stores/useTripStore';
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField';
import EntityListItem from '../../ui/EntityListItem';
import { participantEntityConfig } from '../../config/entityConfig';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import DropdownSelect from '../../ui/DropdownSelect';
import { useTripDates } from '../../hooks/useTripDates';
import ThemedDatePicker from '../../ui/ThemedDatePicker';

// --- Локальный компонент секции ---
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  actionButton?: React.ReactNode;
  headerContent?: React.ReactNode;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  id,
  title,
  icon: Icon,
  children,
  isOpen,
  onToggle,
  actionButton,
  headerContent,
  gradientFrom = 'from-blue-500/5',
  gradientVia = 'via-purple-500/5',
  gradientTo = 'to-pink-500/5',
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} border border-border rounded-xl overflow-hidden transition-all duration-200`}
    >
      <div
        className="flex items-center justify-between gap-3 p-5 cursor-pointer hover:bg-white/40 dark:hover:bg-black/10 transition-colors"
        onClick={() => onToggle(id)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/60 border border-black/5 dark:border-white/10 shadow-sm flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
          {headerContent && <div className="ml-2 flex-shrink-0">{headerContent}</div>}
        </div>
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          {actionButton}
        </div>
      </div>
      {isOpen && <div className="p-5 pt-0">{children}</div>}
    </div>
  );
};

// --- Основной компонент ---

interface TripDetailProps {
  trip: Trip | null;
  onEdit?: () => void; // Оставляем опциональным
  onAddParticipant: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onAddParticipant }) => {
  const navigate = useNavigate();
  const { participants: allParticipants } = useParticipantStore();
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { removeParticipantFromTrip, updateTrip } = useTripStore();

  const [openSections, setOpenSections] = useState<string[]>(['info', 'participants', 'summary']);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);

  // Состояние редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TripData | null>(null);

  // Хук для дат (он нужен для логики изменения дат)
  const {
    dateRange,
    days,
    handleDateRangeChange,
    handleDaysChange: _handleDaysChange,
  } = useTripDates(formData);

  useEffect(() => {
    if (trip) {
      const {
        id: _id,
        createdAt: _createdAt,
        status: _status,
        selectedMeals: _selectedMeals,
        dayMeals: _dayMeals,
        ...data
      } = trip;
      setFormData(data);
    }
  }, [trip]);

  // Синхронизация хука дат с формой при изменении
  useEffect(() => {
    if (formData) {
      setFormData((prev) =>
        prev
          ? {
              ...prev,
              days: days,
              startDate: dateRange[0] ? dateRange[0].toISOString() : '',
              endDate: dateRange[1] ? dateRange[1].toISOString() : '',
            }
          : null
      );
    }
  }, [days, dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const tripParticipants = useMemo(
    () => allParticipants.filter((p) => trip?.participants.includes(p.id)),
    [allParticipants, trip?.participants]
  );

  const summary = useMemo(() => {
    if (!trip) return null;
    return calculateTripSummary(trip, products, allParticipants, dishes);
  }, [trip, products, allParticipants, dishes]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const handleRequestRemove = useCallback((participant: Participant) => {
    setParticipantToRemove(participant);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (participantToRemove && trip) {
      removeParticipantFromTrip(trip.id, participantToRemove.id);
      setParticipantToRemove(null);
    }
  }, [participantToRemove, trip, removeParticipantFromTrip]);

  const handleNavigateToParticipant = useCallback(
    (participantId: number) => {
      navigate(`/participants?selectedId=${participantId}`);
    },
    [navigate]
  );

  const handleNavigateToPlanning = useCallback(() => {
    if (trip) {
      navigate(`/trips/${trip.id}`);
    }
  }, [trip, navigate]);

  const handleSave = () => {
    if (trip && formData && formData.name.trim()) {
      updateTrip(trip.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (trip) {
      const {
        id: _id,
        createdAt: _createdAt,
        status: _status,
        selectedMeals: _selectedMeals,
        dayMeals: _dayMeals,
        ...data
      } = trip;
      setFormData(data);
      // Сброс дат в хуке произойдет автоматически через useEffect(initialData) внутри хука,
      // но нам нужно передать туда новый объект.
      // Проще всего просто закрыть режим, а useEffect с trip обновит данные.
      setIsEditing(false);
    }
  };

  const handleChange = <K extends keyof TripData>(field: K, value: TripData[K]) => {
    setFormData((prev) => (prev ? ({ ...prev, [field]: value } as TripData) : null));
  };

  if (!trip || !formData) return null;

  const difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];

  return (
    <div className="space-y-6 pl-1 pb-10">
      {/* 1. Основная информация (Blue) */}
      <CollapsibleSection
        id="info"
        title="Данные похода"
        icon={Info}
        isOpen={openSections.includes('info')}
        onToggle={handleToggleSection}
        gradientFrom="gradient-trip"
        gradientVia=""
        gradientTo=""
        actionButton={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Изменить
            </Button>
          )
        }
      >
        <div className="space-y-6 pt-2">
          {/* Header Inputs */}
          <div className="flex flex-col gap-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Название"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="text-lg font-bold"
                />
                <Input
                  label="Место (Регион)"
                  value={formData.destination || ''}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  icon={MapPin}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-foreground leading-tight">{trip.name}</h1>
                {trip.destination && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{trip.destination}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isEditing ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Даты</label>
                  <ThemedDatePicker
                    selectsRange
                    startDate={dateRange[0]}
                    endDate={dateRange[1]}
                    onChange={handleDateRangeChange}
                    monthsShown={1}
                    placeholderText="Выберите даты"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Сложность
                  </label>
                  <DropdownSelect
                    icon={Gauge}
                    options={TRIP_DIFFICULTY_OPTIONS}
                    value={formData.difficulty}
                    onChange={(val) => handleChange('difficulty', val as TripData['difficulty'])}
                  />
                </div>
              </>
            ) : (
              <>
                {trip.startDate && (
                  <InfoField
                    icon={Calendar}
                    label="Даты"
                    value={
                      <div className="flex flex-col">
                        <span>{formatDate(trip.startDate)}</span>
                        <span className="text-xs text-muted-foreground">
                          по {formatDate(trip.endDate)}
                        </span>
                      </div>
                    }
                  />
                )}
                <InfoField
                  icon={Sun}
                  label="Длительность"
                  value={`${trip.days} ${trip.days === 1 ? 'день' : trip.days < 5 ? 'дня' : 'дней'}`}
                />
                <InfoField
                  icon={Gauge}
                  iconClassName={difficultyInfo.colorClassName}
                  label="Сложность"
                  value={
                    <span className={cn(difficultyInfo.colorClassName, 'font-bold')}>
                      {difficultyInfo.label}
                    </span>
                  }
                />
              </>
            )}
          </div>

          {/* Description */}
          {(isEditing || trip.description) && (
            <div
              className={cn(
                'rounded-xl',
                isEditing ? '' : 'p-4 bg-white/50 dark:bg-black/20 border border-blue-200/30'
              )}
            >
              {isEditing ? (
                <Textarea
                  label="Описание маршрута"
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                />
              ) : (
                <>
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-2">
                    <FileText className="w-3 h-3" /> Описание маршрута
                  </label>
                  <div className="view-mode-field view-mode-multi-line">
                    {trip.description || 'Нет описания'}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 2. Участники (Purple) - Без изменений логики */}
      <CollapsibleSection
        id="participants"
        title={`Участники (${tripParticipants.length})`}
        icon={Users}
        isOpen={openSections.includes('participants')}
        onToggle={handleToggleSection}
        gradientFrom="gradient-participant"
        gradientVia=""
        gradientTo=""
        actionButton={
          <Button
            size="sm"
            variant="secondary"
            onClick={onAddParticipant}
            disabled={tripParticipants.length >= 20}
          >
            <UserRoundPlus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        }
      >
        <div className="space-y-2 pt-2">
          {tripParticipants.length > 0 ? (
            tripParticipants.map((p: Participant) => {
              const listItemConfig = participantEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => handleNavigateToParticipant(p.id),
                onRemove: () => handleRequestRemove(p),
              });

              return (
                <EntityListItem
                  key={p.id}
                  title={listItemConfig.title(p)}
                  meta={(listItemConfig.details?.(p) || [])
                    .filter((d): d is string => typeof d === 'string')
                    .map((text) => ({ icon: participantEntityConfig.getIcon(p), text }))}
                  menuItems={actions}
                  onSelect={() => handleNavigateToParticipant(p.id)}
                  variant="info"
                />
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-purple-200/50 bg-purple-50/30 rounded-xl">
              Участники не добавлены
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 3. Питание и Планирование (Orange) - Без изменений логики */}
      <CollapsibleSection
        id="summary"
        title="Питание и раскладка"
        icon={Utensils}
        isOpen={openSections.includes('summary')}
        onToggle={handleToggleSection}
        gradientFrom="gradient-nutrition"
        gradientVia=""
        gradientTo=""
        actionButton={
          <Button size="sm" variant="primary" onClick={handleNavigateToPlanning}>
            <HandPlatter className="w-4 h-4 mr-2" />
            Планирование
          </Button>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summary && (
              <InfoField
                icon={BarChart}
                label="Средний вес"
                value={
                  <span>
                    {summary.averageWeightPerPersonPerDay}{' '}
                    <span className="text-xs text-muted-foreground">г/чел/день</span>
                  </span>
                }
              />
            )}
            {summary && (
              <InfoField
                icon={Utensils}
                label="Калорийность"
                value={
                  <span>
                    {summary.averageCaloriesPerPersonPerDay}{' '}
                    <span className="text-xs text-muted-foreground">ккал/чел/день</span>
                  </span>
                }
              />
            )}
          </div>

          {tripParticipants.length === 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Добавьте участников для корректного расчета норм питания на человека.
              </p>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Модалка удаления */}
      <ConfirmModal
        isOpen={!!participantToRemove}
        onClose={() => setParticipantToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Удалить участника?"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите исключить участника{' '}
          <span className="font-bold">{participantToRemove?.name}</span> из этого похода?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default TripDetail;
