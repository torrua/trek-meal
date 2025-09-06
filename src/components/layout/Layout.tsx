// src/components/layout/Layout.tsx

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';
import Input from '../../ui/Input';
import {
  Search,
  Menu,
  X,
  Home,
  Users,
  MapPin,
  Settings,
  Component,
  Soup,
  Tag,
  Backpack,
} from 'lucide-react';

// --- ИЗМЕНЕНИЕ: Новая логическая группировка меню ---
const navigationRow1 = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/trips', label: 'Походы', icon: MapPin },
  { path: '/participants', label: 'Участники', icon: Users },
  { path: '/settings', label: 'Настройки', icon: Settings },
];

const navigationRow2 = [
  { path: '/products', label: 'Продукты', icon: Component },
  { path: '/dishes', label: 'Блюда', icon: Soup },
  { path: '/types-and-categories', label: 'Типы и категории', icon: Tag },
  { path: '/equipment', label: 'Снаряжение', icon: Backpack },
];

// Полный список для мобильного меню
const mobileNavigation = [...navigationRow1, ...navigationRow2];

const Layout: React.FC = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
    clearSearchTerm();
  }, [location.pathname, clearSearchTerm]);

  const getPlaceholder = () => {
    if (location.pathname.startsWith('/products')) return 'Поиск по продуктам...';
    if (location.pathname.startsWith('/dishes')) return 'Поиск по блюдам...';
    if (location.pathname.startsWith('/types-and-categories'))
      return 'Поиск по типам и категориям...';
    if (location.pathname.startsWith('/categories')) return 'Поиск по категориям...';
    if (location.pathname.startsWith('/participants')) return 'Поиск по участникам...';
    if (location.pathname.startsWith('/trips')) return 'Поиск по походам...';
    if (location.pathname.startsWith('/equipment-categories'))
      return 'Поиск по категориям снаряжения...';
    if (location.pathname.startsWith('/equipment')) return 'Поиск по снаряжению...';
    return 'Поиск недоступен';
  };

  const isSearchDisabled = ['/', '/settings', '/meal-types'].includes(location.pathname);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all whitespace-nowrap',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" />
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground hidden sm:block">Trek Meal</h1>
            </div>
            <div className="hidden lg:flex flex-col items-center gap-1">
              <nav className="flex items-center space-x-1">
                {navigationRow1.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
              <nav className="flex items-center space-x-1">
                {navigationRow2.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:block">
                <Input
                  icon={Search}
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSearchDisabled}
                  className="py-2.5 h-10 w-48"
                />
              </div>
              <ThemeSwitcher />
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
          {isMenuOpen && (
            <div className="lg:hidden border-t py-4">
              <div className="space-y-1">
                {mobileNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.path} to={item.path} className={mobileNavLinkClasses} end>
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Input
                  icon={Search}
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSearchDisabled}
                  className="py-3 h-12"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
