// src/components/layout/Layout.tsx - Notion-inspired layout

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';
import {
  Search,
  Menu,
  X,
  Home,
  Users,
  MapPin,
  Settings,
  Package,
  Soup,
  Tag,
  Backpack,
  ChevronRight,
  Command,
} from 'lucide-react';

// Navigation items with Notion-style organization
const workspaceNav = [
  { path: '/', label: 'Главная', icon: Home },
  { path: '/trips', label: 'Походы', icon: MapPin },
  { path: '/participants', label: 'Участники', icon: Users },
];

const databaseNav = [
  { path: '/products', label: 'Продукты', icon: Package },
  { path: '/dishes', label: 'Блюда', icon: Soup },
  { path: '/equipment', label: 'Снаряжение', icon: Backpack },
  { path: '/types-and-categories', label: 'Категории', icon: Tag },
];

const NotionLayout: React.FC = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    clearSearchTerm();
  }, [location.pathname, clearSearchTerm]);

  const getSearchPlaceholder = () => {
    if (isSearchFocused) {
      return 'Поиск продуктов, походов, участников...';
    }
    return 'Поиск';
  };

  const isSearchDisabled =
    ['/', '/settings', '/types-and-categories'].includes(location.pathname) ||
    location.pathname.includes('/trips/');

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'font-sans',
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
          },
        }}
      />

      {/* Notion-style Header */}
      <header className="h-11 bg-white/80 dark:bg-dark-background/80 backdrop-blur-xl border-b border-border dark:border-dark-border sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-notion-sm text-muted-foreground hover:bg-muted 
                         dark:hover:bg-dark-tertiary hover:text-foreground dark:hover:text-white 
                         transition-all duration-100"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo/Brand */}
            <NavLink
              to="/"
              className="flex items-center gap-2 px-2 py-1 rounded-notion-sm hover:bg-muted dark:hover:bg-dark-tertiary transition-all"
            >
              <div className="w-6 h-6 bg-primary rounded-notion-sm flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-notion-base text-foreground dark:text-white hidden sm:block">
                Trek Meal
              </span>
            </NavLink>

            {/* Breadcrumb separator */}
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 hidden lg:block" />

            {/* Page title (breadcrumb style) */}
            <div className="hidden lg:flex items-center gap-1 text-notion-sm text-muted-foreground">
              {location.pathname !== '/' && (
                <span className="font-medium text-foreground dark:text-white">
                  {workspaceNav.find((item) => item.path === location.pathname)?.label ||
                    databaseNav.find((item) => item.path === location.pathname)?.label ||
                    'Страница'}
                </span>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={getSearchPlaceholder()}
                disabled={isSearchDisabled}
                className={cn(
                  'h-7 pl-9 pr-3 bg-muted dark:bg-dark-tertiary rounded-notion-sm',
                  'text-notion-sm text-foreground dark:text-white placeholder:text-muted-foreground',
                  'border border-transparent transition-all duration-200',
                  'focus:outline-none focus:bg-white dark:focus:bg-dark-secondary',
                  'focus:border-border dark:focus:border-dark-border focus:shadow-notion-sm',
                  isSearchFocused ? 'w-64' : 'w-44',
                  isSearchDisabled && 'opacity-50 cursor-not-allowed'
                )}
              />
              {/* Quick search hint */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 pointer-events-none">
                <kbd className="px-1 py-0.5 text-[10px] font-medium text-muted-foreground bg-background dark:bg-dark-tertiary border border-border dark:border-dark-border rounded">
                  ⌘
                </kbd>
                <kbd className="px-1 py-0.5 text-[10px] font-medium text-muted-foreground bg-background dark:bg-dark-tertiary border border-border dark:border-dark-border rounded">
                  K
                </kbd>
              </div>
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Settings */}
            <NavLink
              to="/settings"
              className={cn(
                'p-1.5 rounded-notion-sm text-muted-foreground transition-all duration-100',
                'hover:bg-muted dark:hover:bg-dark-tertiary hover:text-foreground dark:hover:text-white',
                location.pathname === '/settings' && 'bg-primary/10 text-primary'
              )}
            >
              <Settings className="w-4 h-4" />
            </NavLink>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-notion-sm text-muted-foreground hover:bg-muted 
                         dark:hover:bg-dark-tertiary hover:text-foreground dark:hover:text-white 
                         transition-all duration-100 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Notion-style Sidebar */}
        <aside
          className={cn(
            'w-60 bg-secondary dark:bg-dark-secondary border-r border-border dark:border-dark-border',
            'transition-all duration-200 ease-out hidden lg:block',
            'h-[calc(100vh-44px)] sticky top-11 overflow-y-auto notion-scrollbar',
            !isSidebarOpen && 'lg:hidden'
          )}
        >
          <nav className="p-2 space-y-1">
            {/* Workspace section */}
            <div className="mb-4">
              <div className="px-3 py-1.5 text-notion-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Рабочее пространство
              </div>
              {workspaceNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-notion-sm',
                      'text-notion-sm font-medium transition-all duration-100',
                      'hover:bg-muted dark:hover:bg-dark-tertiary',
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Database section */}
            <div>
              <div className="px-3 py-1.5 text-notion-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                База данных
              </div>
              {databaseNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-notion-sm',
                      'text-notion-sm font-medium transition-all duration-100',
                      'hover:bg-muted dark:hover:bg-dark-tertiary',
                      isActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20'
                        : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-12 right-4 w-64 bg-white dark:bg-dark-secondary border border-border dark:border-dark-border rounded-notion-lg shadow-notion-xl z-50 p-2 lg:hidden animate-notion-fade">
              <nav className="space-y-1">
                {[...workspaceNav, ...databaseNav].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2 px-3 py-2 rounded-notion-sm',
                        'text-notion-sm font-medium transition-all duration-100',
                        'hover:bg-muted dark:hover:bg-dark-tertiary',
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/20'
                          : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                      )
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </>
        )}

        {/* Main Content */}
        <main
          className={cn('flex-1 min-h-[calc(100vh-44px)]', isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0')}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default NotionLayout;
