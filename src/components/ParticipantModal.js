// src/components/ParticipantModal.js

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.3rem;
`;

const Form = styled.form`
  display: grid;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const StyledSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &.primary {
    background: #007acc;
    color: white;
    
    &:hover {
      background: #005a9e;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const initialFormData = {
  name: '',
  gender: 'male',
  age: 'adult',
  notes: ''
};

function ParticipantModal({ isOpen, onClose, onSubmit, initialData = null, title }) {
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(initialFormData);
    }
  }, [initialData, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>{title}</ModalTitle>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Имя участника *</Label>
            <Input
              id="name"
              placeholder="Например: Иван Петров"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label htmlFor="gender">Пол</Label>
              <StyledSelect
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="male">👨 Мужской</option>
                <option value="female">👩 Женский</option>
              </StyledSelect>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="age">Возрастная категория</Label>
              <StyledSelect
                id="age"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
              >
                <option value="adult">🧑 Взрослый</option>
                <option value="child">👶 Ребенок</option>
              </StyledSelect>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label htmlFor="notes">Заметки</Label>
            <Input
              id="notes"
              placeholder="Особенности питания, аллергии..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </FormGroup>

          <ModalActions>
            <Button type="button" className="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" className="primary">
              {initialData ? 'Обновить' : 'Добавить'}
            </Button>
          </ModalActions>
        </Form>
      </ModalContent>
    </Modal>
  );
};