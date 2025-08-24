import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import type { Participant, ParticipantData } from '../../types';

interface ParticipantFormProps {
  participant: Participant | null;
  onSubmit: (data: ParticipantData) => void;
  onCancel: () => void;
}

const INITIAL_STATE: ParticipantData = { name: '', gender: 'male', age: 'adult', notes: '' };

const ParticipantForm: React.FC<ParticipantFormProps> = ({ participant, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ParticipantData>(INITIAL_STATE);

  useEffect(() => {
    if (participant) {
      // Исключаем 'id', чтобы соответствовать типу ParticipantData
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...data } = participant;
      setFormData(data);
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [participant]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Имя участника *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
            Пол
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="male">👨 Мужской</option>
            <option value="female">👩 Женский</option>
          </select>
        </div>
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
            Возраст
          </label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="adult">🧑 Взрослый</option>
            <option value="child">👶 Ребенок</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Заметки (аллергии, предпочтения)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          {participant ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
};

export default ParticipantForm;
