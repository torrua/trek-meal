// src/components/layout/Layout.tsx

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
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

  // Notion-style navigation link classes
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    cn(
      'group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap relative',
      'notion-bg-hover notion-focus-ring',
      isActive
        ? 'bg-muted/80 text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    );

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'notion-shadow',
          style: {
            background: 'rgb(var(--card))',
            color: 'rgb(var(--card-foreground))',
            border: '1px solid rgb(var(--border))',
            borderRadius: '8px',
            fontSize: '14px',
          },
        }}
      />

      {/* Notion-style Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b notion-border-subtle sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-6">
              <NavLink
                to="/"
                className="flex items-center gap-3 flex-shrink-0 notion-bg-hover rounded-md px-2 py-1 transition-all"
              >
                <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center notion-shadow-sm">
                  <MapPin className="w-4 h-4 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-foreground hidden sm:block tracking-tight">
                  Trek Meal
                </h1>
              </NavLink>

              {/* Main Navigation - Notion style */}
              <nav className="hidden lg:flex items-center gap-1">
                {mainNavigation.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}

                {/* Subtle divider */}
                <div className="w-px h-4 bg-border mx-3 opacity-50"></div>

                {/* Database Navigation */}
                {dbNavigation.map((item) => (
                  <NavLink key={item.path} to={item.path} className={navLinkClasses} end>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Search and Settings */}
            <div className="flex items-center gap-3">
              {/* Notion-style search */}
              <div className="w-64 hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={getPlaceholder()}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isSearchDisabled}
                    className={cn(
                      'w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-lg',
                      'placeholder:text-muted-foreground text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background',
                      'transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  />
                </div>
              </div>

              {/* Settings and Theme */}
              <div className="hidden lg:flex items-center gap-1">
                <NavLink
                  to="/settings"
                  className="p-2 rounded-lg notion-bg-hover text-muted-foreground hover:text-foreground transition-all notion-focus-ring"
                >
                  <Settings className="w-4 h-4" />
                </NavLink>
                <ThemeSwitcher />
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 notion-bg-hover"
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notion-style Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>
          <div className="fixed top-16 right-4 w-72 bg-card border notion-border-subtle rounded-xl notion-shadow-lg z-50 overflow-hidden notion-scale-in">
            {/* Mobile Search */}
            <div className="p-4 border-b notion-border-subtle">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={getPlaceholder()}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isSearchDisabled}
                  className={cn(
                    'w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border-0 rounded-lg',
                    'placeholder:text-muted-foreground text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-2">
              {mobileNavigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'notion-bg-hover',
                      isActive
                        ? 'bg-muted/80 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )
                  }
                  end
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {/* Theme switcher in mobile menu */}
              <div className="border-t notion-border-subtle pt-2 mt-2">
                <div className="px-3 py-2">
                  <ThemeSwitcher />
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content with Notion-style spacing */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div className="max-w-screen-2xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
