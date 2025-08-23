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

const CardTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1rem;
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
  font-size: 1.1rem;
`;

const NutritionLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
`;

const ProductBreakdown = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 12px;
`;

const ProductItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const ProductName = styled.span`
  font-size: 0.85rem;
  color: #333;
`;

const ProductTotal = styled.span`
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
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
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  margin-top: 12px;
  font-size: 0.85rem;
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

function Summary({ totalWeight, participants, days, selectedMeals, products, nutrition }) {
  const getProductUsage = () => {
    const usage = {};
    Object.values(selectedMeals).forEach(mealProducts => {
      mealProducts.forEach(item => {
        if (!usage[item.productId]) {
          usage[item.productId] = 0;
        }
        usage[item.productId]++;
      });
    });
    return usage;
  };

  const productUsage = getProductUsage();
  const averageWeightPerPerson = totalWeight / participants;
  const averageWeightPerDay = totalWeight / days;
  const averageWeightPerPersonPerDay = totalWeight / (participants * days);

  const perishableProducts = Object.entries(productUsage)
    .filter(([productId]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return product && product.isPerishable;
    })
    .map(([productId]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return product.name;
    });

  if (Object.keys(selectedMeals).length === 0) {
    return (
      <Container>
        <Title>Итоговая сводка</Title>
        <EmptyState>
          <EmptyStateTitle>Нет выбранных продуктов</EmptyStateTitle>
          <EmptyStateText>Выберите продукты для приемов пищи, чтобы увидеть сводку</EmptyStateText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Итоговая сводка</Title>

      <SummaryGrid>
        <SummaryCard>
          <CardTitle>Общий вес</CardTitle>
          <CardValue>{(totalWeight / 1000).toFixed(1)} кг</CardValue>
          <CardLabel>Всего продуктов</CardLabel>
        </SummaryCard>

        <SummaryCard>
          <CardTitle>Распределение</CardTitle>
          <CardValue>{averageWeightPerPersonPerDay.toFixed(0)} г</CardValue>
          <CardLabel>На человека в день</CardLabel>
        </SummaryCard>

        <SummaryCard background="#e8f5e8" borderColor="#28a745">
          <CardTitle>Пищевая ценность</CardTitle>
          <NutritionGrid>
            <NutritionItem>
              <NutritionValue>{Math.round(nutrition.calories)}</NutritionValue>
              <NutritionLabel>ккал</NutritionLabel>
            </NutritionItem>
            <NutritionItem>
              <NutritionValue>{Math.round(nutrition.proteins)}</NutritionValue>
              <NutritionLabel>белки (г)</NutritionLabel>
            </NutritionItem>
            <NutritionItem>
              <NutritionValue>{Math.round(nutrition.fats)}</NutritionValue>
              <NutritionLabel>жиры (г)</NutritionLabel>
            </NutritionItem>
            <NutritionItem>
              <NutritionValue>{Math.round(nutrition.carbs)}</NutritionValue>
              <NutritionLabel>углеводы (г)</NutritionLabel>
            </NutritionItem>
          </NutritionGrid>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              На человека в день: {Math.round(nutrition.calories / (participants * days))} ккал
            </div>
          </div>
        </SummaryCard>

        <SummaryCard background="#f8f9fa" borderColor="#6c757d">
          <CardTitle>Детализация по продуктам</CardTitle>
          <ProductBreakdown>
            {Object.entries(productUsage).map(([productId, count]) => {
              const product = products.find(p => p.id === parseInt(productId));
              if (!product) return null;

              let totalWeightForProduct = 0;
              Object.values(selectedMeals).forEach(mealProducts => {
                mealProducts.forEach(item => {
                  if (item.productId === parseInt(productId)) {
                    const portion = product.portions && product.portions[item.portionIndex];
                    if (portion) {
                      totalWeightForProduct += portion.weight * participants * days;
                    }
                  }
                });
              });

              return (
                <ProductItem key={productId}>
                  <ProductName>
                    {product.name}
                    {product.isPerishable && ' ⚠️'}
                  </ProductName>
                  <ProductTotal>
                    {(totalWeightForProduct / 1000).toFixed(1)} кг
                  </ProductTotal>
                </ProductItem>
              );
            })}
          </ProductBreakdown>
        </SummaryCard>
      </SummaryGrid>

      {averageWeightPerPersonPerDay > 2000 && (
        <Warning>
          ⚠️ <strong>Внимание:</strong> Вес продуктов на человека в день превышает 2 кг. 
          Возможно, стоит пересмотреть план питания.
        </Warning>
      )}

      {averageWeightPerPersonPerDay < 500 && (
        <Warning>
          ⚠️ <strong>Внимание:</strong> Вес продуктов на человека в день менее 500 г. 
          Это может быть недостаточно для активного похода.
        </Warning>
      )}

      {perishableProducts.length > 0 && (
        <PerishableWarning>
          ⚠️ <strong>Внимание:</strong> В вашем плане есть скоропортящиеся продукты:
          <strong> {perishableProducts.join(', ')}</strong>.
          Учтите это при планировании маршрута и хранения.
        </PerishableWarning>
      )}

      {nutrition.calories / (participants * days) < 1500 && (
        <Warning>
          ⚠️ <strong>Внимание:</strong> Калорийность на человека в день менее 1500 ккал.
          Это может быть недостаточно для активного похода.
        </Warning>
      )}

      {nutrition.calories / (participants * days) > 4000 && (
        <Warning>
          ⚠️ <strong>Внимание:</strong> Калорийность на человека в день превышает 4000 ккал.
          Возможно, стоит пересмотреть план питания.
        </Warning>
      )}
    </Container>
  );
}

export default Summary;
