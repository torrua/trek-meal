// src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard';
import TripsPage from './components/trips/TripsPage';
import TripPlanningPage from './components/trip-planning/TripPlanningPage';
import ParticipantsPage from './components/participants/ParticipantsPage';
import SettingsPage from './components/settings/SettingsPage';
import DatabasePage from './components/database/DatabasePage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="nutrition" element={<DatabasePage />} />
        <Route path="participants" element={<ParticipantsPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:tripId" element={<TripPlanningPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
