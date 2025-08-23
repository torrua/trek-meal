// src/components/TripPlanning.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import { formatDate, pluralize, getMealName } from '../utils';
import ParticipantModal from './ParticipantModal';

// --- Styled Components (без изменений) ---

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
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 992px) {
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  max-height: 300px;
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
  
  &:hover {
    background-color: #f8f9fa;
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

const AddButton = styled.button`
  padding: 8px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  
  &:hover {
    background: #218838;
  }
`;

const DayContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  &:last-child {
    margin-bottom: 0;
  }
`;

const DayHeader = styled.div`
  background: #f8f9fa;
  padding: 12px 16px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
`;

const MealsContainer = styled.div`
  padding: 16px;
`;

const MealItem = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MealName = styled.h4`
  margin: 0;
  color: #333;
  font-size: 1rem;
`;

const ProductSelector = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
`;

const ProductCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
  }
`;

const Checkbox = styled.input`
  margin: 0;
`;

const ProductLabel = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const PortionSelector = styled.div`
  margin: 8px 0 8px 24px;
  padding: 8px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const PortionTitle = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
`;

const PortionOptions = styled.div`
  display: grid;
  gap: 4px;
`;

const PortionOption = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.8rem;
`;

const PortionCheckbox = styled.input`
  margin: 0;
`;

const PortionInfo = styled.span`
  color: #333;
`;

const SelectedProducts = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const SelectedProduct = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductInfo = styled.span`
  font-size: 0.85rem;
  color: #333;
`;

const WeightInfo = styled.span`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  padding: 16px;
  background: ${props => props.background || '#f8f9fa'};
  border: 1px solid ${props => props.borderColor || '#e0e0e0'};
  border-radius: 6px;
`;

const CardTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 0.9rem;
  font-weight: 500;
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #007acc;
  margin-bottom: 4px;
`;

const CardLabel = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const NutritionItem = styled.div`
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const NutritionValue = styled.div`
  font-weight: 600;
  color: #007acc;
  font-size: 1rem;
`;

const NutritionLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
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

const PerishableWarning = styled.div`
  padding: 10px 15px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 0.85rem;
`;

function TripPlanning({ trip, products, participants: allParticipants = [], onTripUpdate, onBack }) {
    const [selectedMeals, setSelectedMeals] = useState(trip.selectedMeals || {});
    const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);

    useEffect(() => {
        setSelectedMeals(trip.selectedMeals || {});
    }, [trip.selectedMeals]);

    useEffect(() => {
        if (JSON.stringify(trip.selectedMeals) !== JSON.stringify(selectedMeals)) {
            onTripUpdate(trip.id, { selectedMeals });
        }
    }, [selectedMeals, onTripUpdate, trip.id, trip.selectedMeals]);

    const mealPlan = useMemo(() => {
        const { days, mealsPerDay } = trip;
        return Array.from({ length: days }, (_, dayIndex) => ({
            day: dayIndex + 1,
            meals: Array.from({ length: mealsPerDay }, (_, mealIndex) => ({
                id: `${dayIndex + 1}-${mealIndex + 1}`,
                day: dayIndex + 1,
                meal: mealIndex + 1,
                name: getMealName(mealIndex + 1, mealsPerDay),
            })),
        }));
    }, [trip.days, trip.mealsPerDay]);

    const {
        totalWeight,
        totalNutrition,
        tripParticipants,
        averageWeightPerPersonPerDay,
        averageCaloriesPerPersonPerDay,
        perishableProducts,
    } = useMemo(() => {
        const participantsCount = trip.participants?.length || 1;
        const daysCount = trip.days || 1;
        let baseDailyWeight = 0;
        const baseDailyNutrition = { calories: 0, proteins: 0, fats: 0, carbs: 0 };
        const perishable = new Set();

        Object.values(selectedMeals).forEach(mealProducts => {
            mealProducts.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const portionWeight = item.weight || 0;
                    const weightRatio = portionWeight / 100;
                    
                    baseDailyWeight += portionWeight;
                    baseDailyNutrition.calories += (product.calories || 0) * weightRatio;
                    baseDailyNutrition.proteins += (product.proteins || 0) * weightRatio;
                    baseDailyNutrition.fats += (product.fats || 0) * weightRatio;
                    baseDailyNutrition.carbs += (product.carbs || 0) * weightRatio;
                    
                    if (product.isPerishable) {
                        perishable.add(product.name);
                    }
                }
            });
        });

        const totalWeight = baseDailyWeight * participantsCount * daysCount;
        const totalNutrition = {
            calories: Math.round(baseDailyNutrition.calories * participantsCount * daysCount),
            proteins: Math.round(baseDailyNutrition.proteins * participantsCount * daysCount),
            fats: Math.round(baseDailyNutrition.fats * participantsCount * daysCount),
            carbs: Math.round(baseDailyNutrition.carbs * participantsCount * daysCount),
        };

        const tripParticipants = allParticipants.filter(p => trip.participants?.includes(p.id));
        
        return {
            totalWeight,
            totalNutrition,
            tripParticipants,
            averageWeightPerPersonPerDay: baseDailyWeight,
            averageCaloriesPerPersonPerDay: baseDailyNutrition.calories,
            perishableProducts: Array.from(perishable),
        };
    }, [selectedMeals, trip.participants, trip.days, allParticipants, products]);

    const handleProductToggle = useCallback((mealId, productId) => {
        setSelectedMeals(prev => {
            const newMeals = { ...prev };
            const currentSelection = newMeals[mealId] || [];
            const productIndex = currentSelection.findIndex(item => item.productId === productId);

            if (productIndex > -1) {
                newMeals[mealId] = currentSelection.filter(item => item.productId !== productId);
            } else {
                const product = products.find(p => p.id === productId);
                if (product && product.portions?.length > 0) {
                    newMeals[mealId] = [...currentSelection, {
                        productId,
                        portionIndex: 0,
                        weight: product.portions[0].weight,
                    }];
                }
            }
            return newMeals;
        });
    }, [products]);

    const handlePortionChange = useCallback((mealId, productId, newPortionIndex) => {
        const product = products.find(p => p.id === productId);
        if (!product || !product.portions?.[newPortionIndex]) return;

        setSelectedMeals(prev => {
            const newMeals = { ...prev };
            newMeals[mealId] = (newMeals[mealId] || []).map(item =>
                item.productId === productId
                ? { ...item, portionIndex: newPortionIndex, weight: product.portions[newPortionIndex].weight }
                : item
            );
            return newMeals;
        });
    }, [products]);

    const addParticipant = useCallback((participantId) => {
        if (participantId && !trip.participants?.includes(participantId)) {
            const updatedParticipants = [...new Set([...(trip.participants || []), participantId])];
            onTripUpdate(trip.id, { participants: updatedParticipants });
        }
    }, [trip.id, trip.participants, onTripUpdate]);

    const removeParticipant = useCallback((participantId) => {
        const updatedParticipants = trip.participants?.filter(id => id !== participantId) || [];
        onTripUpdate(trip.id, { participants: updatedParticipants });
    }, [trip.id, trip.participants, onTripUpdate]);

    const handleCreateAndAddParticipant = (participantData) => {
        const tempId = `new_${Date.now()}`;
        const newParticipantPayload = { ...participantData, id: tempId };
        const updatedParticipantIds = [...(trip.participants || []), tempId];
        
        onTripUpdate(trip.id, {
            participants: updatedParticipantIds,
            newParticipant: newParticipantPayload
        });
        setIsParticipantModalOpen(false);
    };

    const getSelectedProductsForMeal = (mealId) => {
        return (selectedMeals[mealId] || []).map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product || !product.portions?.[item.portionIndex]) return null;
            
            const portion = product.portions[item.portionIndex];
            return {
                ...product,
                selectedPortion: portion,
            };
        }).filter(Boolean);
    };

    const availableParticipants = useMemo(() =>
        allParticipants.filter(p => !trip.participants?.includes(p.id)),
        [allParticipants, trip.participants]
    );

    return (
        <>
            <Container>
                <Header>
                    <HeaderLeft>
                        <TripTitle>{trip.name}</TripTitle>
                        <TripSubtitle>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)} • {trip.days} {pluralize(trip.days, ['день', 'дня', 'дней'])}
                        </TripSubtitle>
                    </HeaderLeft>
                    <BackButton onClick={onBack}>← Назад к походам</BackButton>
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
                                        <InfoValue>{tripParticipants.length}</InfoValue>
                                        <InfoLabel>{pluralize(tripParticipants.length, ['участник', 'участника', 'участников'])}</InfoLabel>
                                    </InfoItem>
                                    <InfoItem>
                                        <InfoValue>{(totalWeight / 1000).toFixed(2)}</InfoValue>
                                        <InfoLabel>кг продуктов (всего)</InfoLabel>
                                    </InfoItem>
                                    <InfoItem>
                                        <InfoValue>{Math.round(averageWeightPerPersonPerDay)}</InfoValue>
                                        <InfoLabel>г/чел/день</InfoLabel>
                                    </InfoItem>
                                </TripInfo>
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader><SectionTitle>Участники похода</SectionTitle></SectionHeader>
                            <SectionContent>
                                <div style={{ fontWeight: '500', marginBottom: '10px' }}>Добавить участника:</div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Select
                                        placeholder="Выберите из списка..."
                                        options={availableParticipants.map(p => ({ value: p.id, label: p.name }))}
                                        onChange={(option) => option && addParticipant(option.value)}
                                        value={null}
                                        isClearable
                                        styles={{ container: (base) => ({ ...base, flex: 1 }) }}
                                    />
                                    <AddButton onClick={() => setIsParticipantModalOpen(true)}>+ Создать и добавить</AddButton>
                                </div>
                                

                                {tripParticipants.length > 0 ? (
                                    <ParticipantsList style={{marginTop: '20px'}}>
                                        {tripParticipants.map(participant => (
                                            <ParticipantItem key={participant.id}>
                                                <ParticipantName>{participant.name}</ParticipantName>
                                                <ActionButton className="delete" onClick={() => removeParticipant(participant.id)}>
                                                    Убрать
                                                </ActionButton>
                                            </ParticipantItem>
                                        ))}
                                    </ParticipantsList>
                                ) : <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Участники не добавлены.</p>}
                            </SectionContent>
                        </Section>
                    </LeftColumn>

                    <RightColumn>
                        <Section>
                            <SectionHeader><SectionTitle>План питания</SectionTitle></SectionHeader>
                            <SectionContent>
                                {mealPlan.map(day => (
                                    <DayContainer key={day.day}>
                                        <DayHeader>День {day.day}</DayHeader>
                                        <MealsContainer>
                                            {day.meals.map((meal) => (
                                                <MealItem key={meal.id}>
                                                    <MealHeader><MealName>{meal.name}</MealName></MealHeader>
                                                    <ProductSelector>
                                                        {products.map(product => {
                                                            const selectedItem = selectedMeals[meal.id]?.find(item => item.productId === product.id);
                                                            return (
                                                                <div key={product.id}>
                                                                    <ProductCheckbox>
                                                                        <Checkbox
                                                                            type="checkbox"
                                                                            checked={!!selectedItem}
                                                                            onChange={() => handleProductToggle(meal.id, product.id)}
                                                                        />
                                                                        <ProductLabel>{product.name}</ProductLabel>
                                                                    </ProductCheckbox>
                                                                    
                                                                    {selectedItem && product.portions && (
                                                                        <PortionSelector>
                                                                            <PortionTitle>Порция:</PortionTitle>
                                                                            <PortionOptions>
                                                                                {product.portions.map((portion, idx) => (
                                                                                    <PortionOption key={idx}>
                                                                                        <PortionCheckbox
                                                                                            type="radio"
                                                                                            name={`portion-${meal.id}-${product.id}`}
                                                                                            checked={selectedItem.portionIndex === idx}
                                                                                            onChange={() => handlePortionChange(meal.id, product.id, idx)}
                                                                                        />
                                                                                        <PortionInfo>
                                                                                            {portion.name || `${portion.weight} г`}
                                                                                        </PortionInfo>
                                                                                    </PortionOption>
                                                                                ))}
                                                                            </PortionOptions>
                                                                        </PortionSelector>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </ProductSelector>
                                                    
                                                    {(getSelectedProductsForMeal(meal.id).length > 0) && (
                                                        <SelectedProducts>
                                                            {getSelectedProductsForMeal(meal.id).map(product => (
                                                                <SelectedProduct key={product.id}>
                                                                    <ProductInfo>
                                                                        {product.name} ({product.selectedPortion.name || `${product.selectedPortion.weight} г`})
                                                                    </ProductInfo>
                                                                    <WeightInfo>
                                                                        {product.selectedPortion.weight} г
                                                                    </WeightInfo>
                                                                </SelectedProduct>
                                                            ))}
                                                        </SelectedProducts>
                                                    )}
                                                </MealItem>
                                            ))}
                                        </MealsContainer>
                                    </DayContainer>
                                ))}
                            </SectionContent>
                        </Section>

                        <Section>
                            <SectionHeader><SectionTitle>Итоговая сводка</SectionTitle></SectionHeader>
                            <SectionContent>
                                <SummaryGrid>
                                    <SummaryCard>
                                        <CardTitle>Общий вес</CardTitle>
                                        <CardValue>{(totalWeight / 1000).toFixed(2)} кг</CardValue>
                                        <CardLabel>На {tripParticipants.length} {pluralize(tripParticipants.length, ['человека', 'человек', 'человек'])}</CardLabel>
                                    </SummaryCard>
                                    <SummaryCard>
                                        <CardTitle>Калории (среднее)</CardTitle>
                                        <CardValue>{Math.round(averageCaloriesPerPersonPerDay)}</CardValue>
                                        <CardLabel>ккал/чел/день</CardLabel>
                                    </SummaryCard>
                                </SummaryGrid>
                                
                                <NutritionGrid>
                                    <NutritionItem>
                                        <NutritionValue>{totalNutrition.proteins} г</NutritionValue>
                                        <NutritionLabel>Белки</NutritionLabel>
                                    </NutritionItem>
                                    <NutritionItem>
                                        <NutritionValue>{totalNutrition.fats} г</NutritionValue>
                                        <NutritionLabel>Жиры</NutritionLabel>
                                    </NutritionItem>
                                    <NutritionItem>
                                        <NutritionValue>{totalNutrition.carbs} г</NutritionValue>
                                        <NutritionLabel>Углеводы</NutritionLabel>
                                    </NutritionItem>
                                    <NutritionItem>
                                        <NutritionValue>{totalNutrition.calories}</NutritionValue>
                                        <NutritionLabel>ккал (всего)</NutritionLabel>
                                    </NutritionItem>
                                </NutritionGrid>
                                
                                {averageCaloriesPerPersonPerDay > 0 && averageCaloriesPerPersonPerDay < 1500 && (
                                    <Warning>
                                        ⚠️ <strong>Внимание:</strong> Калорийность менее 1500 ккал/чел/день. Это может быть недостаточно.
                                    </Warning>
                                )}
                                {averageCaloriesPerPersonPerDay > 4000 && (
                                    <Warning>
                                        ⚠️ <strong>Внимание:</strong> Калорийность более 4000 ккал/чел/день. План может быть избыточным.
                                    </Warning>
                                )}
                                {perishableProducts.length > 0 && (
                                    <PerishableWarning>
                                        ⚠️ <strong>Скоропортящиеся продукты:</strong> {perishableProducts.join(', ')}.
                                    </PerishableWarning>
                                )}
                            </SectionContent>
                        </Section>
                    </RightColumn>
                </Content>
            </Container>

            <ParticipantModal
                isOpen={isParticipantModalOpen}
                onClose={() => setIsParticipantModalOpen(false)}
                onSubmit={handleCreateAndAddParticipant}
                title="Создать и добавить участника"
            />
        </>
    );
}

export default TripPlanning;