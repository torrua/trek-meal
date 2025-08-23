import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ParticipantModal from './ParticipantModal'; // Импортируем модальное окно

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

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
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

const ParticipantNotes = styled.p`
  margin: 0 0 12px 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
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
  display: flex;
  align-items: center;
  
  &:before {
    content: '•';
    color: #007acc;
    margin-right: 6px;
  }
`;

const NoTrips = styled.div`
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
`;

const Participants = ({ participants = [], trips = [], onParticipantAdd, onParticipantDelete, onParticipantEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  const getParticipantTrips = (participantId) => {
    return trips
      .filter(trip => trip.participants?.includes(participantId))
      .map(trip => trip.name);
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingParticipant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (participant) => {
    setEditingParticipant(participant);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (formData) => {
    if (editingParticipant) {
      onParticipantEdit(editingParticipant.id, formData);
    } else {
      onParticipantAdd(formData);
    }
  };

  const getAgeText = (age) => {
    return age === 'adult' ? 'Взрослый' : 'Ребенок';
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  return (
    <Container>
      <Title>Управление участниками</Title>
      
      <Header>
        <SearchInput
            placeholder="Поиск по имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <AddButton onClick={handleOpenAddModal}>
          + Добавить участника
        </AddButton>
      </Header>

      {filteredParticipants.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>
            {searchTerm ? 'Участники не найдены' : 'Нет участников'}
          </EmptyStateTitle>
          <EmptyStateText>
            {searchTerm 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Добавьте первого участника для начала работы'
            }
          </EmptyStateText>
          {!searchTerm && (
            <AddButton onClick={handleOpenAddModal}>
              + Добавить участника
            </AddButton>
          )}
        </EmptyState>
      ) : (
        <ParticipantsGrid>
          {filteredParticipants.map(participant => (
            <ParticipantCard key={participant.id}>
              <ParticipantHeader>
                <ParticipantName>
                  {getGenderIcon(participant.gender)} {participant.name}
                </ParticipantName>
                <ParticipantMeta>
                  <MetaTag type="age" value={participant.age}>
                    {getAgeText(participant.age)}
                  </MetaTag>
                </ParticipantMeta>
              </ParticipantHeader>

              <ParticipantBody>
                {participant.notes && (
                  <ParticipantNotes>{participant.notes}</ParticipantNotes>
                )}
                
                <TripList>
                  <TripLabel>Участвует в походах:</TripLabel>
                  {getParticipantTrips(participant.id).length > 0 ? (
                    getParticipantTrips(participant.id).map((tripName, index) => (
                      <TripItem key={index}>{tripName}</TripItem>
                    ))
                  ) : (
                    <NoTrips>Не участвует в походах</NoTrips>
                  )}
                </TripList>
              </ParticipantBody>

              <ParticipantActions>
                <ActionButton onClick={() => handleOpenEditModal(participant)}>
                  Редактировать
                </ActionButton>
                <ActionButton 
                  className="delete"
                  onClick={() => {
                      if (window.confirm(`Вы уверены, что хотите удалить "${participant.name}"?`)) {
                          onParticipantDelete(participant.id);
                      }
                  }}
                >
                  Удалить
                </ActionButton>
              </ParticipantActions>
            </ParticipantCard>
          ))}
        </ParticipantsGrid>
      )}

      <ParticipantModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingParticipant}
        title={editingParticipant ? 'Редактировать участника' : 'Добавить участника'}
      />
    </Container>
  );
}

Participants.propTypes = {
  participants: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    gender: PropTypes.oneOf(['male', 'female']),
    age: PropTypes.oneOf(['adult', 'child']),
    notes: PropTypes.string
  })),
  trips: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    participants: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  })),
  onParticipantAdd: PropTypes.func.isRequired,
  onParticipantDelete: PropTypes.func.isRequired,
  onParticipantEdit: PropTypes.func.isRequired
};

export default Participants;