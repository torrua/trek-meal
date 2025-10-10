// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import TripPlanningPage from './pages/TripPlanningPage';
import SettingsPage from './pages/SettingsPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ParticipantDetailPage from './pages/ParticipantDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import DishesPage from './pages/DishesPage';
import DishDetailPage from './pages/DishDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import MealTypesPage from './pages/MealTypesPage';
import MealTypeDetailPage from './pages/MealTypeDetailPage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import EquipmentCategoriesPage from './pages/EquipmentCategoriesPage';
import EquipmentCategoryDetailPage from './pages/EquipmentCategoryDetailPage';
import MealsPage from './pages/MealsPage';
import MealDetailPage from './pages/MealDetailPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/trips" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductDetailPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="dishes" element={<DishesPage />} />
        <Route path="dishes/new" element={<DishDetailPage />} />
        <Route path="dishes/:dishId/edit" element={<DishDetailPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryDetailPage />} />
        <Route path="categories/:categoryId/edit" element={<CategoryDetailPage />} />
        <Route path="meal-types" element={<MealTypesPage />} />
        <Route path="meal-types/new" element={<MealTypeDetailPage />} />
        <Route path="meal-types/:mealTypeId" element={<MealTypeDetailPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="equipment/new" element={<EquipmentDetailPage />} />
        <Route path="equipment/:equipmentId" element={<EquipmentDetailPage />} />
        <Route path="equipment-categories" element={<EquipmentCategoriesPage />} />
        <Route path="equipment-categories/new" element={<EquipmentCategoryDetailPage />} />
        <Route path="equipment-categories/:categoryId" element={<EquipmentCategoryDetailPage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="participants/new" element={<ParticipantDetailPage />} />
        <Route path="participants/:participantId/edit" element={<ParticipantDetailPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/new" element={<TripDetailPage />} />
        <Route path="trips/:tripId/edit" element={<TripDetailPage />} />
        <Route path="trips/:tripId" element={<TripPlanningPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="meals" element={<MealsPage />} />
        <Route path="meals/new" element={<MealDetailPage />} />
        <Route path="meals/:mealId" element={<MealDetailPage />} />
        <Route path="*" element={<Navigate to="/trips" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
