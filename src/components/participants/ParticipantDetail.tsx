// src/components/participants/ParticipantDetail.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Backpack,
  Award,
  Edit,
  MapPinPlus,
  Trash2,
  ExternalLink,
  Scale,
  ChevronDown,
  FileText,
  Save,
  X,
} from 'lucide-react';
import type { Participant, Trip, ParticipantData } from '../../types';
import useTripStore from '../../stores/useTripStore';
import useEquipmentStore from '../../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import useParticipantStore from '../../stores/useParticipantStore'; // Добавили импорт стора
import { formatDate } from '../../utils/index';
import { EXPERIENCE_CONFIG, EXPERIENCE_OPTIONS } from '../../constants/participants'; // Импорт опций
import { useNavigate } from 'react-router-dom';
import { isFuture, parseISO } from 'date-fns';
import ConfirmModal from '../../ui/ConfirmModal';
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField';
import EntityListItem from '../../ui/EntityListItem';
import { tripEntityConfig } from '../../config/entityConfig';
import cn from 'classnames';
import Input from '../../ui/Input'; // Импорт Input
import Textarea from '../../ui/Textarea'; // Импорт Textarea
import DropdownSelect from '../../ui/DropdownSelect'; // Импорт Select

// --- Локальный компонент секции ---
interface CollapsibleSectionProps {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
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
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {isOpen && <div className="p-5 pt-0">{children}</div>}
    </div>
  );
};

// --- Основной компонент ---

interface ParticipantDetailProps {
  participant: Participant | null;
  onAddToTrip: () => void;
  onEdit?: () => void; // Сделали необязательным, так как теперь редактируем inline
  openSections?: string[];
  onToggleSection?: (sectionId: string) => void;
}

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participant,
  onAddToTrip,
  openSections: externalOpenSections,
  onToggleSection: externalOnToggleSection,
}) => {
  const { trips, removeParticipantFromTrip } = useTripStore();
  const { equipment } = useEquipmentStore();
  const { categories } = useEquipmentCategoryStore();
  const { updateParticipant } = useParticipantStore(); // Получаем метод обновления
  const navigate = useNavigate();

  const [tripToRemove, setTripToRemove] = useState<Trip | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Состояние редактирования
  const [formData, setFormData] = useState<ParticipantData | null>(null); // Данные формы

  // Внутреннее состояние для секций
  const [localOpenSections, setLocalOpenSections] = useState<string[]>([
    'info',
    'trips',
    'equipment',
  ]);

  const sections = externalOpenSections || localOpenSections;
  const toggleSection =
    externalOnToggleSection ||
    ((id: string) => {
      setLocalOpenSections((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    });

  // Инициализация данных формы при изменении участника
  useEffect(() => {
    if (participant) {
      const { id: _id, ...data } = participant;
      setFormData(data);
    }
  }, [participant]);

  const participantTrips = useMemo(
    () => (participant ? trips.filter((trip) => trip.participants.includes(participant.id)) : []),
    [trips, participant]
  );

  const participantEquipment = useMemo(
    () => (participant ? equipment.filter((eq) => eq.ownerId === participant.id) : []),
    [equipment, participant]
  );

  if (!participant || !formData) return null;

  const sortedTrips = [...participantTrips].sort((a, b) => {
    const dateA = parseISO(a.startDate);
    const dateB = parseISO(b.startDate);
    return isFuture(dateA) && !isFuture(dateB)
      ? -1
      : isFuture(dateB)
        ? 1
        : dateB.getTime() - dateA.getTime();
  });

  const handleConfirmRemove = () => {
    if (tripToRemove) {
      removeParticipantFromTrip(tripToRemove.id, participant.id);
      setTripToRemove(null);
    }
  };

  const handleSave = () => {
    if (formData && formData.name.trim()) {
      updateParticipant(participant.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Сброс к исходным данным
    const { id: _id, ...data } = participant;
    setFormData(data);
    setIsEditing(false);
  };

  const handleChange = (field: keyof ParticipantData, value: string | number | boolean) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];

  return (
    <div className="space-y-6 pl-1 pb-10">
      {/* Секция 1: Основная информация */}
      <CollapsibleSection
        id="info"
        title="Личные данные"
        icon={User}
        isOpen={sections.includes('info')}
        onToggle={toggleSection}
        gradientFrom="gradient-participant"
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
          {/* Header Content inside card */}
          <div className="flex flex-col gap-4">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Имя"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="text-lg font-bold"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Опыт</label>
                  <DropdownSelect
                    icon={Award}
                    options={EXPERIENCE_OPTIONS}
                    value={formData.experienceLevel}
                    onChange={(val) => handleChange('experienceLevel', val)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">{participant.name}</h1>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-white/60 dark:bg-black/20 border border-border',
                      experienceInfo.colorClassName
                    )}
                  >
                    <Award className="w-4 h-4" />
                    {experienceInfo.label}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <Input
                  label="Дата рождения"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  icon={Calendar}
                />
                <Input
                  label="Телефон"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  icon={Phone}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  icon={Mail}
                />
              </>
            ) : (
              <>
                {participant.birthDate && (
                  <InfoField
                    icon={Calendar}
                    label="Дата рождения"
                    value={formatDate(participant.birthDate)}
                  />
                )}
                {participant.phone && (
                  <InfoField icon={Phone} label="Телефон" value={participant.phone} />
                )}
                {participant.email && (
                  <InfoField icon={Mail} label="Email" value={participant.email} />
                )}
              </>
            )}
          </div>

          {/* Notes Section */}
          {(isEditing || participant.notes) && (
            <div
              className={cn(
                'rounded-xl',
                isEditing ? '' : 'p-4 bg-white/50 dark:bg-black/20 border border-blue-200/30'
              )}
            >
              {isEditing ? (
                <Textarea
                  label="Заметки"
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  rows={3}
                />
              ) : (
                <>
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-600/70 uppercase tracking-wider mb-2">
                    <FileText className="w-3 h-3" /> Заметки
                  </label>
                  <div className="view-mode-field view-mode-multi-line">
                    {participant.notes || 'Нет заметок'}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Секция 2: Походы */}
      <CollapsibleSection
        id="trips"
        title={`Походы (${sortedTrips.length})`}
        icon={MapPin}
        isOpen={sections.includes('trips')}
        onToggle={toggleSection}
        gradientFrom="gradient-trip"
        gradientVia=""
        gradientTo=""
        actionButton={
          <Button size="sm" variant="primary" onClick={onAddToTrip}>
            <MapPinPlus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        }
      >
        <div className="space-y-2 pt-2">
          {sortedTrips.length > 0 ? (
            sortedTrips.map((trip) => (
              <EntityListItem
                key={trip.id}
                title={tripEntityConfig.views.listItem.title(trip)}
                meta={[
                  { icon: Calendar, text: formatDate(trip.startDate) },
                  { icon: MapPin, text: trip.destination || '—' },
                ]}
                menuItems={[
                  {
                    label: 'Открыть',
                    icon: ExternalLink,
                    onClick: () => navigate(`/trips?selectedId=${trip.id}`),
                  },
                  {
                    label: 'Убрать из похода',
                    icon: Trash2,
                    onClick: () => setTripToRemove(trip),
                    className: 'text-danger',
                  },
                ]}
                variant="neutral"
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-orange-200/50 bg-orange-50/30 rounded-xl">
              Нет активных походов
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Секция 3: Снаряжение */}
      <CollapsibleSection
        id="equipment"
        title={`Личное снаряжение (${participantEquipment.length})`}
        icon={Backpack}
        isOpen={sections.includes('equipment')}
        onToggle={toggleSection}
        gradientFrom="gradient-equipment"
        gradientVia=""
        gradientTo=""
        actionButton={
          <Button size="sm" variant="ghost" onClick={() => navigate('/equipment')}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        }
      >
        <div className="space-y-2 pt-2">
          {participantEquipment.length > 0 ? (
            participantEquipment.map((item) => {
              const _category = categories.find((c) => c.id === item.categoryId);
              return (
                <EntityListItem
                  key={item.id}
                  title={item.name}
                  meta={[{ icon: Scale, text: `${item.weight} г` }]}
                  menuItems={[
                    {
                      label: 'Открыть',
                      icon: ExternalLink,
                      onClick: () => navigate(`/equipment?selectedId=${item.id}`),
                    },
                  ]}
                  variant="info"
                />
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-purple-200/50 bg-purple-50/30 rounded-xl">
              Нет личного снаряжения
            </div>
          )}
        </div>
      </CollapsibleSection>

      <ConfirmModal
        isOpen={!!tripToRemove}
        onClose={() => setTripToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Убрать из похода?"
        variant="danger"
        confirmText="Убрать"
      >
        <p>
          Вы уверены, что хотите убрать участника{' '}
          <span className="font-bold">{participant.name}</span> из похода{' '}
          <span className="font-bold">{tripToRemove?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ParticipantDetail;
