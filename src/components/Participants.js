import React, { useState, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { AppContext } from '../context/AppContext';
import Select from 'react-select';

// ... (Все styled-components остаются без изменений)
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

const SearchContainer = styled.div`
  width: 300px;
`;

const AddButton = styled.button`
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

const ParticipantsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;

const ParticipantCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #007acc;
  }
`;

const ParticipantHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ParticipantName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ParticipantMeta = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 4px 8px;
  background: ${props => {
    if (props.type === 'age') {
      return props.value === 'adult' ? '#e8f5e8' : '#fff3cd';
    }
    return '#e8e8e8';
  }};
  color: ${props => {
    if (props.type === 'age') {
      return props.value === 'adult' ? '#2e7d32' : '#f57f17';
    }
    return '#555';
  }};
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ParticipantBody = styled.div`
  padding: 16px;
`;

const ParticipantNotes = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  font-style: italic;
`;

const TripList = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #eee;
`;

const TripLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
`;

const TripItem = styled.div`
  font-size: 0.8rem;
  color: #333;
  padding: 4px 0;
`;

const NoTrips = styled.div`
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
`;


const ParticipantActions = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
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
  
  &.delete {
    color: #dc3545;
    border-color: #dc3545;
    
    &:hover {
      background: #dc3545;
      color: white;
    }
  }
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

function Participants() {
  const { participants, trips, addParticipant, deleteParticipant, editParticipant } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const getParticipantTrips = (participantId) => {
    return trips.filter(trip => trip.participants?.includes(participantId));
  };

  const filteredParticipants = useMemo(() => 
    participants.filter(participant =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [participants, searchTerm]
  );
  
  const participantOptions = useMemo(() => 
    participants.map(p => ({ value: p.id, label: p.name, participant: p })),
    [participants]
  );

  const handleAddNew = () => {
    setEditingParticipant(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      name: participant.name,
      gender: participant.gender || 'male',
      age: participant.age || 'adult',
      notes: participant.notes || ''
    });
    setShowModal(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      if (editingParticipant) {
        editParticipant(editingParticipant.id, { ...editingParticipant, ...formData });
      } else {
        addParticipant(formData);
      }
      setShowModal(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getGenderIcon = (gender) => (gender === 'male' ? '👨' : '👩');
  const getAgeText = (age) => (age === 'adult' ? 'Взрослый' : 'Ребенок');

  return (
    <Container>
      <Title>Управление участниками</Title>
      
      <Header>
        <SearchContainer>
          <Select
            placeholder="Поиск или выбор для редактирования..."
            isClearable
            options={participantOptions}
            onChange={(option) => {
                if (option) {
                    handleEdit(option.participant);
                }
            }}
            onInputChange={setSearchTerm}
            value={null}
          />
        </SearchContainer>
        <AddButton onClick={handleAddNew}>+ Добавить участника</AddButton>
      </Header>

      {filteredParticipants.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>{searchTerm ? 'Участники не найдены' : 'Нет участников'}</EmptyStateTitle>
          <EmptyStateText>
            {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первого участника для начала работы'}
          </EmptyStateText>
          {!searchTerm && <AddButton onClick={handleAddNew}>+ Добавить участника</AddButton>}
        </EmptyState>
      ) : (
        <ParticipantsGrid>
          {filteredParticipants.map(participant => {
            const participantTrips = getParticipantTrips(participant.id);
            return (
              <ParticipantCard key={participant.id}>
                <ParticipantHeader>
                  <ParticipantName>{getGenderIcon(participant.gender)} {participant.name}</ParticipantName>
                  <ParticipantMeta>
                    <MetaTag type="age" value={participant.age}>{getAgeText(participant.age)}</MetaTag>
                  </ParticipantMeta>
                </ParticipantHeader>

                <ParticipantBody>
                  {participant.notes && <ParticipantNotes>{participant.notes}</ParticipantNotes>}
                  <TripList>
                    <TripLabel>Участвует в походах:</TripLabel>
                    {participantTrips.length > 0 ? (
                      participantTrips.map(trip => <TripItem key={trip.id}>{trip.name}</TripItem>)
                    ) : (
                      <NoTrips>Не участвует в походах</NoTrips>
                    )}
                  </TripList>
                </ParticipantBody>

                <ParticipantActions>
                  <ActionButton onClick={() => handleEdit(participant)}>Редактировать</ActionButton>
                  <ActionButton className="delete" onClick={() => {
                    if (window.confirm(`Вы уверены, что хотите удалить участника "${participant.name}"? Это действие также удалит его из всех походов.`)) {
                      deleteParticipant(participant.id);
                    }
                  }}>Удалить</ActionButton>
                </ParticipantActions>
              </ParticipantCard>
            );
          })}
        </ParticipantsGrid>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editingParticipant ? 'Редактировать участника' : 'Добавить участника'}</ModalTitle>
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="name">Имя участника *</Label>
                <Input id="name" placeholder="Например: Иван Петров" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
              </FormGroup>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="gender">Пол</Label>
                  <StyledSelect id="gender" value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}>
                    <option value="male">👨 Мужской</option>
                    <option value="female">👩 Женский</option>
                  </StyledSelect>
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="age">Возрастная категория</Label>
                  <StyledSelect id="age" value={formData.age} onChange={(e) => handleChange('age', e.target.value)}>
                    <option value="adult">🧑 Взрослый</option>
                    <option value="child">👶 Ребенок</option>
                  </StyledSelect>
                </FormGroup>
              </FormRow>
              <FormGroup>
                <Label htmlFor="notes">Заметки (аллергии, предпочтения)</Label>
                <Input id="notes" placeholder="Например: аллергия на орехи" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
              </FormGroup>
              <ModalActions>
                <Button type="button" className="secondary" onClick={() => setShowModal(false)}>Отмена</Button>
                <Button type="submit" className="primary">{editingParticipant ? 'Сохранить' : 'Добавить'}</Button>
              </ModalActions>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

export default Participants;