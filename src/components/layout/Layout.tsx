import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';
import Sidebar from './Sidebar';
import { Search, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
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
    ['/', '/settings', '/categories', '/meal-types', '/equipment-categories'].includes(
      location.pathname
    ) || location.pathname.includes('/trips/');

  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter((p) => p);
    // You would have a mapping from path part to label
    // This is a simplified example
    return pathParts.length > 0 ? pathParts.join(' / ') : 'Главная';
  };

  return (
    <div className="min-h-screen bg-background flex">
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

      <Sidebar isSidebarOpen={isSidebarOpen} location={location} />

      <div className="flex-1 flex flex-col">
        <header className="bg-background/80 backdrop-blur-xl border-b notion-border-subtle sticky top-0 z-40">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex justify-between items-center h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg notion-bg-hover text-muted-foreground hover:text-foreground transition-all notion-focus-ring"
                >
                  {isSidebarOpen ? (
                    <ChevronsLeft className="w-5 h-5" />
                  ) : (
                    <ChevronsRight className="w-5 h-5" />
                  )}
                </button>
                <div className="text-sm text-muted-foreground capitalize">{getBreadcrumbs()}</div>
              </div>

              <div className="flex items-center gap-3">
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

                <div className="flex items-center gap-1">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
