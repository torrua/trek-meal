import React, { useContext } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { calculateTripSummary } from '../utils';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  color: #007acc;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledLink = styled(NavLink)`
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  text-decoration: none;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #005a9e;
  }
`;

const TripsList = styled.div`
  display: grid;
  gap: 12px;
`;

const TripCard = styled.div`
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const TripName = styled.h4`
  margin: 0;
  color: #333;
  font-size: 1.1rem;
`;

const TripStatus = styled.span`
  padding: 4px 8px;
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
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const TripInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 12px;
`;

const TripInfoItem = styled.div`
  text-align: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const TripInfoValue = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
`;

const TripInfoLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
`;

const ProductsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
`;

const ProductCard = styled.div`
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
`;

const ProductName = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1rem;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`;

const MetaTag = styled.span`
  padding: 2px 6px;
  background: #e8e8e8;
  color: #555;
  border-radius: 3px;
  font-size: 0.7rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const EmptyStateTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.1rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #666;
`;

function Dashboard() {
  const { trips, products, participants } = useContext(AppContext);
  const navigate = useNavigate();

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Планируется';
      case 'active': return 'Активен';
      case 'completed': return 'Завершен';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестно';
    }
  };

  const getRecentTrips = () => {
    return [...trips]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getRecentProducts = () => {
    return products.slice(-6).reverse();
  };

  const getRecentParticipants = () => {
    return participants.slice(-6).reverse();
  };

  return (
    <Container>
      <Title>Обзор</Title>

      <StatsGrid>
        <StatCard>
          <StatValue>{trips.length}</StatValue>
          <StatLabel>Всего походов</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{products.length}</StatValue>
          <StatLabel>Продуктов в базе</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{participants.length}</StatValue>
          <StatLabel>Участников</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {trips.filter(t => t.status === 'planning').length}
          </StatValue>
          <StatLabel>Планируется</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {trips.filter(t => t.status === 'completed').length}
          </StatValue>
          <StatLabel>Завершено</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>
          Последние походы
          <StyledLink to="/trips">Создать поход</StyledLink>
        </SectionTitle>
        
        {trips.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>Нет походов</EmptyStateTitle>
            <EmptyStateText>Создайте первый поход для начала планирования</EmptyStateText>
            <StyledLink to="/trips" style={{ marginTop: '12px' }}>
              Создать поход
            </StyledLink>
          </EmptyState>
        ) : (
          <TripsList>
            {getRecentTrips().map(trip => {
              const summary = calculateTripSummary(trip, products);
              return (
                <TripCard key={trip.id} onClick={() => navigate(`/trips/${trip.id}`)}>
                  <TripHeader>
                    <TripName>{trip.name}</TripName>
                    <TripStatus status={trip.status}>
                      {getStatusText(trip.status)}
                    </TripStatus>
                  </TripHeader>
                  
                  <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '8px' }}>
                    {trip.description}
                  </div>
                  
                  <TripInfo>
                    <TripInfoItem>
                      <TripInfoValue>{trip.days || 0}</TripInfoValue>
                      <TripInfoLabel>дней</TripInfoLabel>
                    </TripInfoItem>
                    <TripInfoItem>
                      <TripInfoValue>{trip.participants?.length || 0}</TripInfoValue>
                      <TripInfoLabel>участников</TripInfoLabel>
                    </TripInfoItem>
                    <TripInfoItem>
                      <TripInfoValue>{(summary.totalWeight / 1000).toFixed(1)}</TripInfoValue>
                      <TripInfoLabel>кг</TripInfoLabel>
                    </TripInfoItem>
                    <TripInfoItem>
                      <TripInfoValue>
                        {new Date(trip.createdAt).toLocaleDateString('ru-RU')}
                      </TripInfoValue>
                      <TripInfoLabel>создан</TripInfoLabel>
                    </TripInfoItem>
                  </TripInfo>
                </TripCard>
              );
            })}
          </TripsList>
        )}
      </Section>

      <Section>
        <SectionTitle>
          Последние продукты
          <StyledLink to="/products">Управление продуктами</StyledLink>
        </SectionTitle>
        
        {products.length === 0 ? (
          <EmptyState>
            <EmptyStateTitle>Нет продуктов</EmptyStateTitle>
            <EmptyStateText>Добавьте продукты для планирования питания</EmptyStateText>
          </EmptyState>
        ) : (
          <ProductsList>
            {getRecentProducts().map(product => (
              <ProductCard key={product.id}>
                <ProductName>{product.name}</ProductName>
                <ProductMeta>
                  {product.packaging && (
                    <MetaTag>{product.packaging}</MetaTag>
                  )}
                  {product.isPerishable && (
                    <MetaTag style={{ background: '#fff3cd', color: '#856404' }}>
                      Скоропортящийся
                    </MetaTag>
                  )}
                </ProductMeta>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  {product.calories} ккал • {product.proteins}г белки • {product.fats}г жиры • {product.carbs}г углеводы
                </div>
              </ProductCard>
            ))}
          </ProductsList>
        )}
      </Section>
    </Container>
  );
}

export default Dashboard;