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
import Button from 'ui/Button';

const mainNavigation = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/trips', label: 'Походы', icon: MapPin },
  { path: '/participants', label: 'Участники', icon: Users },
];

const dbNavigation = [
  { path: '/products', label: 'Продукты', icon: Component },
  { path: '/dishes', label: 'Блюда', icon: Soup },
  { path: '/equipment', label: 'Снаряжение', icon: Backpack },
  { path: '/types-and-categories', label: 'Категории', icon: Tag },
];

const settingsNavigation = [{ path: '/settings', label: 'Настройки', icon: Settings }];

const mobileNavigation = [...mainNavigation, ...dbNavigation, ...settingsNavigation];

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
    if (location.pathname.startsWith('/equipment')) return 'Поиск по снаряжению...';
    if (location.pathname.startsWith('/participants')) return 'Поиск по участникам...';
    if (location.pathname.startsWith('/trips')) return 'Поиск по походам...';
    return 'Поиск';
  };

  const isSearchDisabled =
    ['/', '/settings', '/types-and-categories'].includes(location.pathname) ||
    location.pathname.includes('/trips/');

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap',
      isActive
        ? 'bg-muted text-foreground'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    );

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-right" />
      <header className="bg-card/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <NavLink to="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-bold text-foreground hidden sm:block">Trek Meal</h1>
              </NavLink>
              {/* Desktop Nav */}
              <nav className="hidden lg:flex items-center gap-1 border-l pl-4">
                {mainNavigation.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                <div className="w-px h-5 bg-border mx-2"></div>
                {dbNavigation.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <div className="w-48">
                <Input
                  icon={Search}
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSearchDisabled}
                  className="h-9"
                />
              </div>
              <nav className="hidden lg:flex items-center gap-1 border-l pl-2 ml-2">
                {settingsNavigation.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <item.icon className="w-4 h-4" />
                  </NavLink>
                ))}
                <ThemeSwitcher />
              </nav>
              <div className="lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="fixed top-16 right-4 w-64 bg-card border rounded-lg shadow-xl z-50 p-4">
            <nav className="flex flex-col gap-1">
              {mobileNavigation.map((item) => (
                <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <div className="border-t pt-2 mt-2">
                <ThemeSwitcher />
              </div>
            </nav>
          </div>
        </div>
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
