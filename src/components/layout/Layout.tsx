// src/components/layout/Layout.tsx

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';
import Input from '../../ui/Input';
import { Search, Menu, X, Home, Utensils, Users, MapPin, Settings } from 'lucide-react';

const navigation = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/nutrition', label: 'Питание', icon: Utensils },
  { path: '/participants', label: 'Участники', icon: Users },
  { path: '/trips', label: 'Походы', icon: MapPin },
  { path: '/settings', label: 'Настройки', icon: Settings },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Закрывать мобильное меню при смене страницы
  useEffect(() => {
    setIsMenuOpen(false);
    clearSearchTerm();
  }, [location.pathname, clearSearchTerm]);

  const getPlaceholder = () => {
    if (location.pathname.startsWith('/nutrition')) return 'Поиск по питанию...';
    if (location.pathname.startsWith('/participants')) return 'Поиск по участникам...';
    if (location.pathname.startsWith('/trips')) return 'Поиск по походам...';
    return 'Поиск недоступен';
  };

  const isSearchDisabled = ['/', '/settings'].includes(location.pathname);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all',
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" />
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Trek Meal</h1>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
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
              <div className="md:hidden">
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
            <div className="md:hidden border-t py-4">
              <div className="space-y-1">
                {navigation.map((item) => {
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
