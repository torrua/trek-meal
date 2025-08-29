// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import TripsPage from './components/trips/TripsPage';
import TripPlanningPage from './components/trip-planning/TripPlanningPage';
import ProductsPage from './components/products/ProductsPage';
import ParticipantsPage from './components/participants/ParticipantsPage';
import CategoriesPage from './components/categories/CategoriesPage';
import DishesPage from './components/dishes/DishesPage';
import SettingsPage from './components/settings/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="dishes" element={<DishesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:tripId" element={<TripPlanningPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
