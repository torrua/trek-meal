import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [participants, setParticipants] = useState([]);

  // Загружаем данные из localStorage при запуске
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('trek-meal-products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedTrips = localStorage.getItem('trek-meal-trips');
      if (savedTrips) setTrips(JSON.parse(savedTrips));

      const savedParticipants = localStorage.getItem('trek-meal-participants');
      if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  // Сохраняем данные в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('trek-meal-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('trek-meal-trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('trek-meal-participants', JSON.stringify(participants));
  }, [participants]);

  // --- Управление продуктами ---
  const handleProductAdd = useCallback((product) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }]);
  }, []);

  const handleProductDelete = useCallback((productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    // TODO: Также нужно удалить этот продукт из всех походов
  }, []);

  const handleProductEdit = useCallback((id, updatedProduct) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  }, []);


  // --- Управление участниками ---
  const handleParticipantAdd = useCallback((participant) => {
    const newParticipant = { ...participant, id: Date.now() };
    setParticipants(prev => [...prev, newParticipant]);
    return newParticipant;
  }, []);
  
  const handleParticipantDelete = useCallback((id) => {
    setTrips(prev => prev.map(trip => ({
      ...trip,
      participants: trip.participants?.filter(pid => pid !== id) || []
    })));
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleParticipantEdit = useCallback((id, updatedParticipant) => {
    setParticipants(prev => prev.map(p => p.id === id ? updatedParticipant : p));
  }, []);


  // --- Управление походами ---
  const handleTripCreate = useCallback((tripData) => {
    const newTrip = {
      ...tripData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'planning',
      selectedMeals: {},
      participants: tripData.participants || [],
    };
    setTrips(prev => [...prev, newTrip]);
    return newTrip;
  }, []);

  const handleTripUpdate = useCallback((tripId, updatedData) => {
    setTrips(prev => prev.map(trip =>
      trip.id === tripId ? { ...trip, ...updatedData } : trip
    ));
  }, []);

  const handleTripDelete = useCallback((tripId) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  }, []);
  
  const value = {
    products,
    trips,
    participants,
    addProduct: handleProductAdd,
    deleteProduct: handleProductDelete,
    editProduct: handleProductEdit,
    addParticipant: handleParticipantAdd,
    deleteParticipant: handleParticipantDelete,
    editParticipant: handleParticipantEdit,
    addTrip: handleTripCreate,
    updateTrip: handleTripUpdate,
    deleteTrip: handleTripDelete,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}