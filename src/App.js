import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Trips from './components/Trips';
import TripPlanning from './components/TripPlanning';
import Participants from './components/Participants';

const AppContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f4f7f9;
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

const NavButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.active ? '#007acc' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#007acc' : '#e0e0e0'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? '#005a9e' : '#f0f0f0'};
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
  const [currentView, setCurrentView] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [participants, setParticipants] = useState([]);

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('trek-meal-products');
      const savedTrips = localStorage.getItem('trek-meal-trips');
      const savedParticipants = localStorage.getItem('trek-meal-participants');
      
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedTrips) setTrips(JSON.parse(savedTrips));
      if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    localStorage.setItem('trek-meal-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('trek-meal-trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('trek-meal-participants', JSON.stringify(participants));
  }, [participants]);

  // --- CRUD для Продуктов ---
  const handleProductAdd = (product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }]);
  };

  const handleProductDelete = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleProductEdit = (id, updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  // --- CRUD для Участников ---
  const handleParticipantAdd = (participant) => {
    setParticipants(prev => [...prev, { ...participant, id: Date.now() }]);
  };

  const handleParticipantDelete = (id) => {
    setTrips(prev => prev.map(trip => ({
      ...trip,
      participants: trip.participants?.filter(pid => pid !== id) || []
    })));
    setParticipants(prev => prev.filter(p => p.id !== id));
  };

  const handleParticipantEdit = (id, updatedParticipant) => {
    setParticipants(prev => prev.map(p => p.id === id ? updatedParticipant : p));
  };

  // --- CRUD для Походов ---
  const handleTripCreate = (tripData) => {
    const newTrip = {
      ...tripData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'planning',
      selectedMeals: {}
    };
    setTrips(prev => [...prev, newTrip]);
    setCurrentTripId(newTrip.id);
    setCurrentView('trip-planning');
  };

  const handleTripUpdate = (tripId, updatedData) => {
    let finalData = { ...updatedData };
    
    // ИСПРАВЛЕНО: Эта логика теперь централизованно обрабатывает создание нового участника
    if (updatedData.newParticipant) {
        const newParticipant = { ...updatedData.newParticipant, id: Date.now() };
        setParticipants(prev => [...prev, newParticipant]);
        
        const tempId = updatedData.newParticipant.id;
        finalData.participants = updatedData.participants.map(pId => pId === tempId ? newParticipant.id : pId);
        delete finalData.newParticipant;
    }

    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, ...finalData } : trip
    ));
  };

  const handleTripDelete = (tripId) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
    if (currentTripId === tripId) {
      setCurrentTripId(null);
      setCurrentView('trips');
    }
  };

  const handleTripSelect = (trip) => {
    setCurrentTripId(trip.id);
    setCurrentView('trip-planning');
  };
  
  const handleNavigate = (view) => {
    if (view !== 'trip-planning') {
        setCurrentTripId(null);
    }
    setCurrentView(view);
  }

  const currentTrip = trips.find(trip => trip.id === currentTripId);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            trips={trips}
            products={products}
            participants={participants}
            onTripSelect={handleTripSelect}
            onNavigate={handleNavigate}
          />
        );
      case 'products':
        return (
          <Products 
            products={products}
            onProductAdd={handleProductAdd}
            onProductDelete={handleProductDelete}
            onProductEdit={handleProductEdit}
          />
        );
      case 'participants':
        return (
          <Participants 
            participants={participants}
            trips={trips}
            onParticipantAdd={handleParticipantAdd}
            onParticipantDelete={handleParticipantDelete}
            onParticipantEdit={handleParticipantEdit}
          />
        );
      case 'trips':
        return (
          <Trips 
            trips={trips}
            participants={participants}
            products={products}
            onTripSelect={handleTripSelect}
            onTripDelete={handleTripDelete}
            onCreateTrip={handleTripCreate}
          />
        );
      case 'trip-planning':
        return currentTrip ? (
          <TripPlanning 
            key={currentTrip.id}
            trip={currentTrip}
            products={products}
            participants={participants}
            onTripUpdate={handleTripUpdate}
            onBack={() => handleNavigate('trips')}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Поход не выбран или не найден</p>
            <button onClick={() => handleNavigate('trips')}>
              Вернуться к списку походов
            </button>
          </div>
        );
      default:
        return <Dashboard trips={trips} products={products} participants={participants} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppContainer>
      <Header>
        <Title>Trek Meal</Title>
        <Subtitle>Планирование питания для походов</Subtitle>
      </Header>

      <Navigation>
        <NavButton active={currentView === 'dashboard'} onClick={() => handleNavigate('dashboard')}>Главная</NavButton>
        <NavButton active={currentView === 'products'} onClick={() => handleNavigate('products')}>Продукты</NavButton>
        <NavButton active={currentView === 'participants'} onClick={() => handleNavigate('participants')}>Участники</NavButton>
        <NavButton active={currentView === 'trips'} onClick={() => handleNavigate('trips')}>Походы</NavButton>
        {currentTrip && (
          <NavButton active={currentView === 'trip-planning'} onClick={() => setCurrentView('trip-planning')}>
            Планирование: {currentTrip.name}
          </NavButton>
        )}
      </Navigation>

      <MainContent>
        {renderContent()}
      </MainContent>
    </AppContainer>
  );
}

export default App;