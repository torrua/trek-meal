import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import ThemeManager from './context/ThemeManager'; // <-- Импортируем

import App from './App';
import './index.css'; // Изменяем импорт на index.css

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeManager />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
