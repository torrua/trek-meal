import React, { useContext, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Select from 'react-select';
import { AppContext } from '../context/AppContext';
import { calculateTripSummary, getMealName, pluralize, formatDate } from '../utils';

// ... (Все styled-components остаются без изменений)
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderLeft = styled.div``;

const TripTitle = styled.h2`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 500;
`;

const TripSubtitle = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const BackButton = styled.button`
  padding: 10px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #5a6268;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 500;
`;

const SectionContent = styled.div`
  padding: 20px;
`;

const TripInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007acc;
  margin-bottom: 4px;
`;

const InfoLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const ParticipantsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
`;

const ParticipantItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ParticipantName = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  
  &.delete {
    color: #dc3545;
    border-color: #dc3545;
  }
`;

const DayContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  &:last-child { margin-bottom: 0; }
`;

const DayHeader = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  font-weight: 600;
  color: #333;
`;

const MealItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  &:last-child { border-bottom: none; }
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MealName = styled.h4`
  margin: 0;
  font-size: 1rem;
`;

const SelectedProducts = styled.div`
  margin-top: 12px;
  display: grid;
  gap: 8px;
`;

const SelectedProduct = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const ProductInfo = styled.span`
  font-size: 0.85rem;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PortionSelect = styled.select`
  padding: 4px 6px;
  font-size: 0.8rem;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
`;

const SummaryCard = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

const CardTitle = styled.h4`
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  font-weight: 500;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007acc;
`;

const Warning = styled.div`
  padding: 12px;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 0.85rem;
`;

function TripPlanning() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, products, participants, updateTrip } = useContext(AppContext);

  const trip = useMemo(() => trips.find(t => t.id === Number(tripId)), [trips, tripId]);

  const summary = useMemo(
    () => calculateTripSummary(trip, products, participants),
    [trip, products, participants]
  );

  const productOptions = useMemo(() => 
    products.map(p => ({ value: p.id, label: p.name })), 
    [products]
  );
  
  const availableParticipantsOptions = useMemo(() =>
    participants
      .filter(p => !trip?.participants?.includes(p.id))
      .map(p => ({ value: p.id, label: p.name })),
    [participants, trip]
  );
  
  const handleMealUpdate = useCallback((newSelectedMeals) => {
    if (trip) {
        updateTrip(trip.id, { selectedMeals: newSelectedMeals });
    }
  }, [trip, updateTrip]);

  const handleProductAdd = (mealId, productOption) => {
    const product = products.find(p => p.id === productOption.value);
    if (!product || !product.portions?.length) return;

    const newSelectedMeals = { ...(trip.selectedMeals || {}) };
    if (!newSelectedMeals[mealId]) newSelectedMeals[mealId] = [];
    
    if (newSelectedMeals[mealId].some(item => item.productId === product.id)) return;

    newSelectedMeals[mealId].push({
      productId: product.id,
      portionIndex: 0,
      weight: product.portions[0].weight,
    });
    handleMealUpdate(newSelectedMeals);
  };
  
  const handleProductRemove = (mealId, productId) => {
    const newSelectedMeals = { ...(trip.selectedMeals || {}) };
    newSelectedMeals[mealId] = newSelectedMeals[mealId].filter(p => p.productId !== productId);
    handleMealUpdate(newSelectedMeals);
  };

  const handlePortionChange = (mealId, productId, newPortionIndex) => {
    const product = products.find(p => p.id === productId);
    if (!product || !product.portions?.[newPortionIndex]) return;

    const newSelectedMeals = { ...(trip.selectedMeals || {}) };
    newSelectedMeals[mealId] = (newSelectedMeals[mealId] || []).map(item =>
        item.productId === productId
        ? { ...item, portionIndex: newPortionIndex, weight: product.portions[newPortionIndex].weight }
        : item
    );
    handleMealUpdate(newSelectedMeals);
  };
  
  const handleParticipantAdd = (option) => {
    const participantId = option.value;
    if (participantId && !trip.participants?.includes(participantId)) {
      updateTrip(trip.id, { participants: [...trip.participants, participantId] });
    }
  };

  const handleParticipantRemove = (participantId) => {
    if (window.confirm('Удалить участника из этого похода?')) {
      updateTrip(trip.id, { participants: trip.participants.filter(id => id !== participantId) });
    }
  };

  if (!trip) {
    return (
      <Container>
        <h2>Поход не найден</h2>
        <BackButton onClick={() => navigate('/trips')}>← Назад к походам</BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <TripTitle>{trip.name}</TripTitle>
          <TripSubtitle>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</TripSubtitle>
        </HeaderLeft>
        <BackButton onClick={() => navigate('/trips')}>← Назад к походам</BackButton>
      </Header>

      <Content>
        <LeftColumn>
          <Section>
            <SectionHeader><SectionTitle>Информация о походе</SectionTitle></SectionHeader>
            <SectionContent>
                <TripInfo>
                    <InfoItem>
                        <InfoValue>{trip.days}</InfoValue>
                        <InfoLabel>{pluralize(trip.days, ['день', 'дня', 'дней'])}</InfoLabel>
                    </InfoItem>
                    <InfoItem>
                        <InfoValue>{summary.tripParticipants.length}</InfoValue>
                        <InfoLabel>{pluralize(summary.tripParticipants.length, ['участник', 'участника', 'участников'])}</InfoLabel>
                    </InfoItem>
                    <InfoItem>
                        <InfoValue>{(summary.totalWeight / 1000).toFixed(2)}</InfoValue>
                        <InfoLabel>кг продуктов</InfoLabel>
                    </InfoItem>
                    <InfoItem>
                        <InfoValue>{summary.averageWeightPerPersonPerDay}</InfoValue>
                        <InfoLabel>г/чел/день</InfoLabel>
                    </InfoItem>
                </TripInfo>
            </SectionContent>
          </Section>
          
          <Section>
            <SectionHeader><SectionTitle>Участники похода</SectionTitle></SectionHeader>
            <SectionContent>
              <div style={{ fontWeight: '500', marginBottom: '10px' }}>Добавить участника:</div>
                <Select
                    placeholder="Выберите из списка..."
                    options={availableParticipantsOptions}
                    onChange={handleParticipantAdd}
                    value={null}
                    noOptionsMessage={() => 'Все участники уже добавлены'}
                />
              {summary.tripParticipants.length > 0 ? (
                  <ParticipantsList>
                      {summary.tripParticipants.map(participant => (
                          <ParticipantItem key={participant.id}>
                              <ParticipantName>{participant.name}</ParticipantName>
                              <ActionButton className="delete" onClick={() => handleParticipantRemove(participant.id)}>
                                  Убрать
                              </ActionButton>
                          </ParticipantItem>
                      ))}
                  </ParticipantsList>
              ) : <p style={{ textAlign: 'center', color: '#666', marginTop: '16px' }}>Участники не добавлены.</p>}
            </SectionContent>
          </Section>

          <Section>
            <SectionHeader><SectionTitle>Итоговая сводка</SectionTitle></SectionHeader>
            <SectionContent>
              <SummaryGrid>
                  <SummaryCard>
                      <CardTitle>Общий вес</CardTitle>
                      <CardValue>{(summary.totalWeight / 1000).toFixed(2)} кг</CardValue>
                  </SummaryCard>
                  <SummaryCard>
                      <CardTitle>Калории (среднее)</CardTitle>
                      <CardValue>{summary.averageCaloriesPerPersonPerDay}</CardValue>
                      <InfoLabel>ккал/чел/день</InfoLabel>
                  </SummaryCard>
              </SummaryGrid>
              
              {summary.averageCaloriesPerPersonPerDay > 0 && summary.averageCaloriesPerPersonPerDay < 1500 && (
                  <Warning>⚠️ <strong>Внимание:</strong> Калорийность менее 1500 ккал/чел/день. Этого может быть недостаточно.</Warning>
              )}
              {summary.averageCaloriesPerPersonPerDay > 4000 && (
                  <Warning>⚠️ <strong>Внимание:</strong> Калорийность более 4000 ккал/чел/день. План может быть избыточным.</Warning>
              )}
              {summary.perishableProducts.length > 0 && (
                  <Warning>⚠️ <strong>Скоропортящиеся продукты:</strong> {summary.perishableProducts.join(', ')}.</Warning>
              )}
            </SectionContent>
          </Section>
        </LeftColumn>

        <RightColumn>
          <Section>
            <SectionHeader><SectionTitle>План питания</SectionTitle></SectionHeader>
            <SectionContent>
              {Array.from({ length: trip.days }).map((_, dayIndex) => (
                <DayContainer key={dayIndex}>
                  <DayHeader>День {dayIndex + 1}</DayHeader>
                  {Array.from({ length: trip.mealsPerDay }).map((_, mealIndex) => {
                    const mealId = `${dayIndex + 1}-${mealIndex + 1}`;
                    const selectedProductsForMeal = (trip.selectedMeals?.[mealId] || []);

                    return (
                      <MealItem key={mealId}>
                        <MealHeader>
                          <MealName>{getMealName(mealIndex + 1, trip.mealsPerDay)}</MealName>
                        </MealHeader>
                        
                        {selectedProductsForMeal.length > 0 && (
                          <SelectedProducts>
                            {selectedProductsForMeal.map(item => {
                              const product = products.find(p => p.id === item.productId);
                              if (!product) return null;
                              return (
                                <SelectedProduct key={product.id}>
                                  <ProductInfo title={product.name}>{product.name}</ProductInfo>
                                  {product.portions.length > 1 ? (
                                    <PortionSelect value={item.portionIndex} onChange={(e) => handlePortionChange(mealId, product.id, parseInt(e.target.value, 10))}>
                                      {product.portions.map((p, i) => <option key={i} value={i}>{p.name} ({p.weight}г)</option>)}
                                    </PortionSelect>
                                  ) : <span>{item.weight} г</span>}
                                  <ActionButton className="delete" onClick={() => handleProductRemove(mealId, product.id)}>×</ActionButton>
                                </SelectedProduct>
                              );
                            })}
                          </SelectedProducts>
                        )}

                        <div style={{marginTop: '10px'}}>
                           <Select
                             options={productOptions.filter(opt => !selectedProductsForMeal.some(p => p.productId === opt.value))}
                             onChange={(option) => handleProductAdd(mealId, option)}
                             placeholder="Добавить продукт..."
                             value={null}
                             styles={{ menu: base => ({ ...base, zIndex: 10 }) }}
                             noOptionsMessage={() => 'Все продукты уже добавлены'}
                           />
                        </div>
                      </MealItem>
                    );
                  })}
                </DayContainer>
              ))}
            </SectionContent>
          </Section>
        </RightColumn>
      </Content>
    </Container>
  );
}

export default TripPlanning;