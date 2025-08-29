// src/components/participants/ParticipantDetail.tsx

import React, { useState, useEffect } from 'react';
import { User, Edit, Copy, Trash2, Baby } from 'lucide-react';
import type { Participant, ParticipantData } from '../../types';
import useParticipantStore from '../../stores/useParticipantStore';
import ParticipantForm from './ParticipantForm';
import ConfirmModal from '../../ui/ConfirmModal';
import Button from '../../ui/Button';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import { calculateAge } from '../../utils';
import cn from 'classnames';

interface ParticipantDetailProps {
  participantId: number | null;
  onDeselect: () => void;
  onEditRequest?: (participant: Participant) => void;
  onCloneRequest?: (participantId: number) => void;
  onDeleteRequest?: (participant: Participant) => void;
}

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participantId,
  onDeselect,
  onEditRequest,
  onCloneRequest,
  onDeleteRequest,
}) => {
  const { participants, updateParticipant } = useParticipantStore();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (participantId) {
      const selected = participants.find((p) => p.id === participantId);
      setParticipant(selected || null);
    } else {
      setParticipant(null);
    }
    // При смене участника сбрасываем режим редактирования
    setIsEditing(false);
    setIsDirty(false);
  }, [participantId, participants]);

  const handleEdit = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      if (onEditRequest && participant) {
        // Если есть внешний обработчик редактирования, используем его
        onEditRequest(participant);
      } else {
        // Иначе переключаем локальный режим редактирования
        setIsEditing((prev) => !prev);
      }
    }
  };

  const handleFormSubmit = async (data: ParticipantData) => {
    if (!participant) return;
    await updateParticipant(participant.id, data);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleConfirmLeave = () => {
    setIsEditing(false);
    setIsDirty(false);
    setShowConfirm(false);
  };

  const handleClone = () => {
    if (onCloneRequest && participant) {
      onCloneRequest(participant.id);
    }
  };

  const handleDelete = () => {
    if (onDeleteRequest && participant) {
      onDeleteRequest(participant);
    }
  };

  // Если никто не выбран, показываем заглушку
  if (!participant) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground">Участник не выбран</h3>
        <p className="text-muted-foreground mt-1">
          Выберите участника из списка слева, чтобы посмотреть детали.
        </p>
      </div>
    );
  }

  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';

  return (
    <div className="bg-card h-full flex flex-col">
      {isEditing ? (
        <div className="p-6 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Редактирование</h3>
          <ParticipantForm
            participant={participant}
            onSubmit={handleFormSubmit}
            onCancel={handleEdit}
            onDirtyChange={setIsDirty}
          />
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          {/* Детальная информация о участнике */}
          <div className="p-6">
            {/* Заголовок с кнопками действий */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {isChild ? (
                    <Baby className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{participant.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Редактировать
                </Button>
                {onCloneRequest && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClone}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Клонировать
                  </Button>
                )}
                {onDeleteRequest && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Удалить
                  </Button>
                )}
              </div>
            </div>

            {/* Детальная информация */}
            <div className="bg-background border rounded-lg p-6 space-y-6">
              {/* Основные характеристики */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Пол
                  </label>
                  <p className="text-foreground">
                    {participant.gender === 'male' ? 'Мужской' : 'Женский'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Возрастная группа
                  </label>
                  <p className="text-foreground">
                    {participant.age === 'adult' ? 'Взрослые' : 'Дети'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Уровень опыта
                  </label>
                  <span
                    className={cn(
                      'inline-flex px-2 py-1 text-xs font-medium rounded border',
                      experienceInfo.className
                    )}
                  >
                    {experienceInfo.label}
                  </span>
                </div>
              </div>

              {/* Контактная информация */}
              {(participant.phone || participant.email) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {participant.phone && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Телефон
                      </label>
                      <p className="text-foreground">{participant.phone}</p>
                    </div>
                  )}
                  {participant.email && (
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Email
                      </label>
                      <p className="text-foreground break-all">{participant.email}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Дата рождения */}
              {participant.birthDate && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Дата рождения
                  </label>
                  <p className="text-foreground">
                    {new Date(participant.birthDate).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              )}

              {/* Заметки */}
              {participant.notes && (
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Заметки
                  </label>
                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-foreground whitespace-pre-wrap">{participant.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmLeave}
        title="Несохраненные изменения"
        confirmText="Уйти"
        variant="danger"
      >
        <p>
          Вы уверены, что хотите отменить редактирование? Все внесенные изменения будут потеряны.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ParticipantDetail;
