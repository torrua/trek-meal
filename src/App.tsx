// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
// import Dashboard from './components/Dashboard';
import TripPlanningPage from './pages/TripPlanningPage';
import SettingsPage from './pages/SettingsPage';
import TripsPage from './pages/TripsPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ProductsPage from './pages/ProductsPage';
import DishesPage from './pages/DishesPage';
import CategoriesPage from './pages/CategoriesPage';
import MealTypesPage from './pages/MealTypesPage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentCategoriesPage from './pages/EquipmentCategoriesPage';
import TypesAndCategoriesPage from './pages/TypesAndCategoriesPage';
import MealsPage from './pages/MealsPage';
import MealDetailPage from './pages/MealDetailPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/trips" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="dishes" element={<DishesPage />} />
        <Route path="types-and-categories" element={<TypesAndCategoriesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="meal-types" element={<MealTypesPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="equipment-categories" element={<EquipmentCategoriesPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:tripId" element={<TripPlanningPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="meals" element={<MealsPage />} />
        <Route path="meals/:mealId" element={<MealDetailPage />} />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
