import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const PrimaryButton = styled(Button)`
  background: #007bff;
  color: white;
`;

const SecondaryButton = styled(Button)`
  background: #6c757d;
  color: white;
`;

const ParticipantModal = ({
  isOpen,
  onClose,
  onSubmit,
  participant = null,
  title = 'Добавить участника',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: 'adult',
    gender: 'male',
    notes: '',
  });

  useEffect(() => {
    if (participant) {
      setFormData({
        name: participant.name || '',
        age: participant.age || 'adult',
        gender: participant.gender || 'male',
        notes: participant.notes || '',
      });
    } else {
      setFormData({
        name: '',
        age: 'adult',
        gender: 'male',
        notes: '',
      });
    }
  }, [participant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Имя *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="age">Возраст</Label>
            <Select
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
            >
              <option value="adult">Взрослый</option>
              <option value="child">Ребенок</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="gender">Пол</Label>
            <Select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="notes">Примечания</Label>
            <Input
              as="textarea"
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
            />
          </FormGroup>
          
          <ButtonGroup>
            <SecondaryButton type="button" onClick={onClose}>
              Отмена
            </SecondaryButton>
            <PrimaryButton type="submit">
              {participant ? 'Сохранить' : 'Добавить'}
            </PrimaryButton>
          </ButtonGroup>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

ParticipantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  participant: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    age: PropTypes.oneOf(['adult', 'child']),
    gender: PropTypes.oneOf(['male', 'female']),
    notes: PropTypes.string,
  }),
  title: PropTypes.string,
};

export default ParticipantModal;
