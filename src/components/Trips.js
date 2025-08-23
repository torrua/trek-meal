// src/components/Trips.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { calculateTotalWeight } from '../utils';

const Container = styled.div`
  padding: 24px;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 500;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CreateButton = styled.button`
  padding: 12px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #218838;
  }
`;

const TripsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const TripCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #007acc;
  }
`;

const TripHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
`;

const TripName = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.3rem;
`;

const TripDescription = styled.p`
  color: #666;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const TripMeta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #666;
`;

const TripBody = styled.div`
  padding: 20px;
`;

const TripStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007acc;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const TripActions = styled.div`
  padding: 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    color: #007acc;
  }
  
  &.primary {
    background: #007acc;
    color: white;
    border-color: #007acc;
    
    &:hover {
      background: #005a9e;
    }
  }
  
  &.delete {
    color: #dc3545;
    border-color: #dc3545;
    
    &:hover {
      background: #dc3545;
      color: white;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  background: ${props => {
    switch (props.status) {
      case 'planning': return '#fff3cd';
      case 'active': return '#d1ecf1';
      case 'completed': return '#d4edda';
      case 'cancelled': return '#f8d7da';
      default: return '#e8e8e8';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'planning': return '#856404';
      case 'active': return '#0c5460';
      case 'completed': return '#155724';
      case 'cancelled': return '#721c24';
      default: return '#666';
    }
  }};
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.3rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
`;

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
  max-width: 600px;
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

const Textarea = styled.textarea`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const ParticipantsSection = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
`;

const ParticipantsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ParticipantsTitle = styled.h4`
  margin: 0;
  color: #333;
  font-size: 1rem;
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

const DateRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const initialFormData = {
    name: '',
    description: '',
    days: 1,
    mealsPerDay: 3,
    participants: [],
    startDate: '',
    endDate: '',
    destination: '',
    difficulty: 'easy'
};


function Trips({ trips, participants, products, onCreateTrip, onTripSelect, onTripDelete }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Планируется';
      case 'active': return 'Активен';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 1;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
        let newFormData = { ...prev, [field]: value };

        if (field === 'startDate') {
            if (newFormData.endDate && new Date(value) > new Date(newFormData.endDate)) {
                newFormData.endDate = value;
            }
            newFormData.days = calculateDays(value, newFormData.endDate);
        } else if (field === 'endDate') {
            if (newFormData.startDate && new Date(newFormData.startDate) <= new Date(value)) {
                newFormData.days = calculateDays(newFormData.startDate, value);
            }
        }
        return newFormData;
    });
  };

  const handleCreateTrip = () => {
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onCreateTrip({
        ...formData,
        name: formData.name.trim(),
        days: parseInt(formData.days, 10) || 1,
        mealsPerDay: parseInt(formData.mealsPerDay, 10) || 3,
      });
      setShowModal(false);
    } else {
        alert("Название похода не может быть пустым.");
    }
  };

  const handleParticipantToggle = (participantId) => {
    setFormData(prev => {
      const newParticipants = prev.participants.includes(participantId)
        ? prev.participants.filter(id => id !== participantId)
        : [...prev.participants, participantId];
      
      return {
        ...prev,
        participants: newParticipants
      };
    });
  };

  return (
    <Container>
      <Title>Управление походами</Title>
      
      <Header>
        <div>
          <h3 style={{ margin: '0 0 8px 0', color: '#666', fontSize: '1rem' }}>
            Всего походов: {trips.length}
          </h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
            Создавайте и планируйте походы, управляйте участниками и питанием
          </p>
        </div>
        <CreateButton onClick={handleCreateTrip}>
          + Создать поход
        </CreateButton>
      </Header>

      {trips.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>Нет походов</EmptyStateTitle>
          <EmptyStateText>Создайте первый поход для начала планирования</EmptyStateText>
          <CreateButton onClick={handleCreateTrip}>
            + Создать поход
          </CreateButton>
        </EmptyState>
      ) : (
        <TripsGrid>
          {trips.map(trip => (
            <TripCard key={trip.id} onClick={() => onTripSelect(trip)}>
              <TripHeader>
                <TripName>{trip.name}</TripName>
                <TripDescription>{trip.description}</TripDescription>
                <TripMeta>
                  <MetaItem>
                    <span>📍</span>
                    {trip.destination || 'Место не указано'}
                  </MetaItem>
                  <MetaItem>
                    <span>📅</span>
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString('ru-RU') : 'Дата не указана'}
                  </MetaItem>
                  <MetaItem>
                    <span>🏔️</span>
                    {trip.difficulty === 'easy' ? 'Легкий' : 
                     trip.difficulty === 'medium' ? 'Средний' : 
                     trip.difficulty === 'hard' ? 'Сложный' : 'Не указано'}
                  </MetaItem>
                  <StatusBadge status={trip.status}>
                    {getStatusText(trip.status)}
                  </StatusBadge>
                </TripMeta>
              </TripHeader>

              <TripBody>
                <TripStats>
                  <StatItem>
                    <StatValue>{trip.days}</StatValue>
                    <StatLabel>дней</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{trip.participants?.length || 0}</StatValue>
                    <StatLabel>участников</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{trip.mealsPerDay}</StatValue>
                    <StatLabel>приемов пищи</StatLabel>
                  </StatItem>
                  <StatItem>
                    <StatValue>{(calculateTotalWeight(trip, products) / 1000).toFixed(1)}</StatValue>
                    <StatLabel>кг продуктов</StatLabel>
                  </StatItem>
                </TripStats>

                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  <strong>Участники:</strong> {trip.participants?.map(id => {
                    const participant = participants.find(p => p.id === id);
                    return participant ? participant.name : 'Неизвестный';
                  }).join(', ') || 'Не указаны'}
                </div>
              </TripBody>

              <TripActions>
                <ActionButton 
                  className="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTripSelect(trip);
                  }}
                >
                  Планировать
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Вы уверены, что хотите удалить этот поход?')) {
                      onTripDelete(trip.id);
                    }
                  }}
                >
                  Удалить
                </ActionButton>
              </TripActions>
            </TripCard>
          ))}
        </TripsGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Создать новый поход</ModalTitle>
            
            <Form onSubmit={handleSubmit}>
               <FormGroup>
                  <Label htmlFor="name">Название похода *</Label>
                  <Input
                    id="name"
                    placeholder="Например: Поход в горы"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="destination">Место назначения</Label>
                  <Input
                    id="destination"
                    placeholder="Например: Кавказские горы"
                    value={formData.destination}
                    onChange={(e) => handleChange('destination', e.target.value)}
                  />
                </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Опишите маршрут, цели похода..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </FormGroup>

              {/* ИЗМЕНЕНО: Единый блок для выбора диапазона дат */}
              <FormGroup>
                <Label>Даты похода</Label>
                <DateRangeContainer>
                    <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                    <span>—</span>
                    <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        min={formData.startDate}
                    />
                </DateRangeContainer>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="days">Количество дней</Label>
                  <Input
                    id="days"
                    type="number"
                    value={formData.days}
                    readOnly // Поле только для чтения, т.к. считается автоматически
                    style={{ background: '#f8f9fa' }}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="mealsPerDay">Приемов пищи в день</Label>
                  <Select
                    id="mealsPerDay"
                    value={formData.mealsPerDay}
                    onChange={(e) => handleChange('mealsPerDay', e.target.value)}
                  >
                    <option value={3}>3 (Завтрак, Обед, Ужин)</option>
                    <option value={4}>4 (Завтрак, Перекус, Обед, Ужин)</option>
                    <option value={5}>5 (Завтрак, Перекус, Обед, Полдник, Ужин)</option>
                  </Select>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="difficulty">Сложность</Label>
                <Select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Средний</option>
                  <option value="hard">Сложный</option>
                </Select>
              </FormGroup>

              <ParticipantsSection>
                <ParticipantsHeader>
                  <ParticipantsTitle>Участники похода (необязательно)</ParticipantsTitle>
                </ParticipantsHeader>
                
                {participants.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    Сначала добавьте участников в соответствующем разделе.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '150px', overflowY: 'auto', paddingRight: '8px' }}>
                    {participants.map(participant => (
                      <label key={participant.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.participants.includes(participant.id)}
                          onChange={() => handleParticipantToggle(participant.id)}
                        />
                        <span>{participant.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </ParticipantsSection>

              <ModalActions>
                <Button type="button" className="secondary" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="primary">
                  Создать поход
                </Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default Trips;