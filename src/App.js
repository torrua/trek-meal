import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Dashboard from './components/Dashboard';
import TripsPage from './components/trips/TripsPage';
import TripPlanningPage from './components/trip-planning/TripPlanningPage';
import ProductsPage from './components/products/ProductsPage';
import ParticipantsPage from './components/participants/ParticipantsPage';
import CategoriesPage from './components/categories/CategoriesPage';
import { Toaster } from 'react-hot-toast';

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #fafafa;
  min-height: 100vh;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 500;
  color: #333;
`;

const Subtitle = styled.p`
  margin: 8px 0 0 0;
  font-size: 0.9rem;
  color: #666;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const StyledNavLink = styled(NavLink)`
  padding: 12px 20px;
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;

  &.active {
    background: #007acc;
    color: white;
    border-color: #007acc;
  }
  
  &:hover:not(.active) {
    background: #f0f0f0;
    border-color: #007acc;
  }
`;

const MainContent = styled.main`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  min-height: 600px;
`;

function App() {
  const location = useLocation();
  const planningPathMatch = location.pathname.match(/\/trips\/(\d+)/);

  return (
      <AppContainer>
      <Toaster position="bottom-right" />
      <Header>
        <Title>Trek Meal</Title>
        <Subtitle>Планирование питания для походов</Subtitle>
      </Header>

      <Navigation>
        <StyledNavLink to="/">Главная</StyledNavLink>
        <StyledNavLink to="/products">Продукты</StyledNavLink>
        <StyledNavLink to="/categories">Категории</StyledNavLink>
        <StyledNavLink to="/participants">Участники</StyledNavLink>
        <StyledNavLink to="/trips">Походы</StyledNavLink>
        {planningPathMatch && (
          <StyledNavLink to={location.pathname}>
            Планирование
          </StyledNavLink>
        )}
      </Navigation>

      <MainContent>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />          
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:tripId" element={<TripPlanningPage />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;