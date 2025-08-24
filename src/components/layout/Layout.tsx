// src/components/layout/Layout.tsx

import React from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';

// Стили для NavLink, вынесены для чистоты
const navLinkBaseClasses = "px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium border";
const navLinkInactiveClasses = "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-blue-500";
const navLinkActiveClasses = "bg-blue-600 text-white border-blue-600 shadow-sm";

const Layout: React.FC = () => {
  const location = useLocation();
  // Более надежная проверка, что мы находимся на странице планирования конкретного похода
  const isPlanningPage = /^\/trips\/\d+$/.test(location.pathname);

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      <Toaster position="bottom-right" />
      
      <header className="text-center mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Trek Meal</h1>
        <p className="mt-1 text-sm text-gray-500">Планирование питания для походов</p>
      </header>

      <nav className="flex justify-center gap-2 mb-6 flex-wrap">
        <NavLink 
          to="/"
          className={({ isActive }) => cn(navLinkBaseClasses, { [navLinkActiveClasses]: isActive, [navLinkInactiveClasses]: !isActive })}
        >
          Главная
        </NavLink>
        <NavLink 
          to="/products"
          className={({ isActive }) => cn(navLinkBaseClasses, { [navLinkActiveClasses]: isActive, [navLinkInactiveClasses]: !isActive })}
        >
          Продукты
        </NavLink>
        <NavLink 
          to="/categories"
          className={({ isActive }) => cn(navLinkBaseClasses, { [navLinkActiveClasses]: isActive, [navLinkInactiveClasses]: !isActive })}
        >
          Категории
        </NavLink>
        <NavLink 
          to="/participants"
          className={({ isActive }) => cn(navLinkBaseClasses, { [navLinkActiveClasses]: isActive, [navLinkInactiveClasses]: !isActive })}
        >
          Участники
        </NavLink>
        <NavLink 
          to="/trips"
          // Ссылка на "Походы" активна, только если мы на /trips, но не на /trips/:id
          className={({ isActive }) => cn(navLinkBaseClasses, { [navLinkActiveClasses]: isActive && !isPlanningPage, [navLinkInactiveClasses]: !isActive || isPlanningPage })}
        >
          Походы
        </NavLink>
        {isPlanningPage && (
          // Эта ссылка появляется только на странице планирования и всегда активна
          <NavLink 
            to={location.pathname}
            className={cn(navLinkBaseClasses, navLinkActiveClasses)}
          >
            Планирование
          </NavLink>
        )}
      </nav>

      <main className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[600px]">
        {/* Здесь будут рендериться дочерние роуты */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;