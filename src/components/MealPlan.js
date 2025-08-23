import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: white;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Title = styled.h2`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
`;

const DayContainer = styled.div`
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
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

const MealName = styled.h3`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyStateTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.1rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

function MealPlan({ mealPlan, products, selectedMeals, onMealSelection, participants }) {
  const handleProductToggle = (mealId, productId) => {
    const currentSelection = selectedMeals[mealId] || [];
    let newSelection;

    if (currentSelection.some(item => item.productId === productId)) {
      newSelection = currentSelection.filter(item => item.productId !== productId);
    } else {
      const product = products.find(p => p.id === productId);
      if (product && product.portions && product.portions.length > 0) {
        newSelection = [...currentSelection, {
          productId,
          portionIndex: 0,
          weight: product.portions[0].weight
        }];
      }
    }
    onMealSelection(mealId, newSelection);
  };

  const handlePortionChange = (mealId, productId, portionIndex) => {
    const currentSelection = selectedMeals[mealId] || [];
    const product = products.find(p => p.id === productId);

    if (product && product.portions && product.portions[portionIndex]) {
      const newSelection = currentSelection.map(item =>
        item.productId === productId
          ? { ...item, portionIndex, weight: product.portions[portionIndex].weight }
          : item
      );
      onMealSelection(mealId, newSelection);
    }
  };

  const getSelectedProductsForMeal = (mealId) => {
    return (selectedMeals[mealId] || []).map(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return null;

      const portion = product.portions && product.portions[item.portionIndex];
      if (!portion) return null;

      return {
        ...product,
        selectedPortion: portion,
        totalWeight: portion.weight * participants
      };
    }).filter(Boolean);
  };

  if (products.length === 0) {
    return (
      <Container>
        <Title>План питания</Title>
        <EmptyState>
          <EmptyStateTitle>Нет продуктов</EmptyStateTitle>
          <EmptyStateText>Добавьте продукты, чтобы начать планирование питания</EmptyStateText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>План питания</Title>
      {mealPlan.map(day => (
        <DayContainer key={day.day}>
          <DayHeader>День {day.day}</DayHeader>
          <MealsContainer>
            {day.meals.map(meal => {
              const selectedProducts = getSelectedProductsForMeal(meal.id);
              const totalWeight = selectedProducts.reduce((sum, p) => sum + p.totalWeight, 0);

              return (
                <MealItem key={meal.id}>
                  <MealHeader>
                    <MealName>{meal.name}</MealName>
                    {totalWeight > 0 && (
                      <span style={{ color: '#28a745', fontWeight: '500', fontSize: '0.9rem' }}>
                        {totalWeight} г
                      </span>
                    )}
                  </MealHeader>

                  <ProductSelector>
                    {products.map(product => {
                      const isSelected = selectedMeals[meal.id]?.some(item => item.productId === product.id);
                      const selectedItem = selectedMeals[meal.id]?.find(item => item.productId === product.id);

                      return (
                        <div key={product.id}>
                          <ProductCheckbox>
                            <Checkbox
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleProductToggle(meal.id, product.id)}
                            />
                            <ProductLabel>{product.name}</ProductLabel>
                          </ProductCheckbox>

                          {isSelected && product.portions && product.portions.length > 0 && (
                            <PortionSelector>
                              <PortionTitle>Выберите порцию:</PortionTitle>
                              <PortionOptions>
                                {product.portions.map((portion, index) => (
                                  <PortionOption key={index}>
                                    <PortionCheckbox
                                      type="radio"
                                      name={`portion-${meal.id}-${product.id}`}
                                      checked={selectedItem?.portionIndex === index}
                                      onChange={() => handlePortionChange(meal.id, product.id, index)}
                                    />
                                    <PortionInfo>
                                      {portion.weight} г
                                      {portion.isDivisible && ' (делимая)'}
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

                  {selectedProducts.length > 0 && (
                    <SelectedProducts>
                      <strong style={{ fontSize: '0.85rem' }}>Выбранные продукты:</strong>
                      {selectedProducts.map(product => (
                        <SelectedProduct key={product.id}>
                          <ProductInfo>
                            {product.name} - {product.selectedPortion.weight} г
                            {product.selectedPortion.isDivisible && ' (делимая порция)'}
                          </ProductInfo>
                          <WeightInfo>{product.totalWeight} г</WeightInfo>
                        </SelectedProduct>
                      ))}
                    </SelectedProducts>
                  )}
                </MealItem>
              );
            })}
          </MealsContainer>
        </DayContainer>
      ))}
    </Container>
  );
}

export default MealPlan;
