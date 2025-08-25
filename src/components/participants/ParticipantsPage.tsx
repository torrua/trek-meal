// src/components/participants/ParticipantsPage.tsx

import React, { useState, useMemo } from 'react';
import useParticipantStore from '../../stores/useParticipantStore';
import useSearchStore from '../../stores/useSearchStore';
import type { Participant, ParticipantData } from '../../types';

import ParticipantCard from './ParticipantCard';
import ParticipantForm from './ParticipantForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ConfirmModal from '../../ui/ConfirmModal';

function ParticipantsPage() {
  const { participants, addParticipant, updateParticipant, deleteParticipant } =
    useParticipantStore();
  const { searchTerm } = useSearchStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) {
      return participants;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return participants.filter(
      (participant: Participant) =>
        participant.name.toLowerCase().includes(lowercasedFilter) ||
        participant.notes?.toLowerCase().includes(lowercasedFilter)
    );
  }, [participants, searchTerm]);

  const handleAddNew = () => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsModalOpen(true);
  };

  // --- ИЗМЕНЕНИЕ ---
  const handleDeleteRequest = (e: React.MouseEvent, participant: Participant) => {
    e.stopPropagation(); // Останавливаем всплытие
    setParticipantToDelete(participant);
  };

  const handleConfirmDelete = () => {
    if (participantToDelete) {
      deleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
    }
  };

  const handleFormSubmit = (formData: ParticipantData) => {
    if (editingParticipant) {
      updateParticipant(editingParticipant.id, formData);
    } else {
      addParticipant(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Управление участниками</h2>
        <Button onClick={handleAddNew} variant="primary">
          + Добавить участника
        </Button>
      </header>

      {filteredParticipants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">
            {searchTerm ? 'Участники не найдены' : 'Участников пока нет'}
          </h3>
          <p className="text-gray-500 mt-2 mb-4">
            {searchTerm
              ? 'Попробуйте изменить поисковый запрос.'
              : 'Добавьте первого участника, чтобы начать планирование походов.'}
          </p>
          {!searchTerm && (
            <Button onClick={handleAddNew} variant="primary">
              Добавить первого участника
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParticipants.map((p) => (
            <ParticipantCard
              key={p.id}
              participant={p}
              onEdit={() => handleEdit(p)}
              // --- ИЗМЕНЕНИЕ ---
              onDelete={(e) => handleDeleteRequest(e, p)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingParticipant ? 'Редактировать участника' : 'Новый участник'}
      >
        <ParticipantForm
          participant={editingParticipant}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!participantToDelete}
        onClose={() => setParticipantToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Подтвердите удаление"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-bold">&quot;{participantToDelete?.name}&ldquo;</span>?
        </p>
        <p className="mt-2 text-sm text-gray-500">Это действие также удалит его из всех походов.</p>
      </ConfirmModal>
    </div>
  );
}

export default ParticipantsPage;
