import React, { useState } from 'react';
import useParticipantStore from '../../stores/useParticipantStore';
import ParticipantCard from './ParticipantCard';
import ParticipantForm from './ParticipantForm';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

function ParticipantsPage() {
  // Получаем данные и действия прямо из стора
  const { participants, addParticipant, updateParticipant, deleteParticipant } = useParticipantStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAddNew = () => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setIsModalOpen(true);
  };
  
  const handleDeleteRequest = (participant) => {
    setConfirmDelete(participant);
  };
  
  const handleDeleteConfirm = () => {
    if (confirmDelete) {
      deleteParticipant(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleFormSubmit = (formData) => {
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
        <Button onClick={handleAddNew} variant="primary">+ Добавить участника</Button>
      </header>

      {participants.length === 0 ? (
        <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">Участники не найдены</h3>
          <p className="text-gray-500 mt-2 mb-4">Добавьте первого участника, чтобы начать планирование походов.</p>
          <Button onClick={handleAddNew} variant="primary">Добавить первого участника</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {participants.map(p => (
            <ParticipantCard 
              key={p.id} 
              participant={p} 
              onEdit={() => handleEdit(p)}
              onDelete={() => handleDeleteRequest(p)} 
            />
          ))}
        </div>
      )}
      
      {/* Модальное окно для создания/редактирования */}
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

      {/* Модальное окно для подтверждения удаления */}
      <Modal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Подтвердите удаление"
      >
        <p className="text-gray-700">
          Вы уверены, что хотите удалить участника "{confirmDelete?.name}"? 
          Это действие также удалит его из всех походов.
        </p>
        <div className="flex justify-end gap-3 pt-6">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Отмена</Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>Удалить</Button>
        </div>
      </Modal>
    </div>
  );
}

export default ParticipantsPage;