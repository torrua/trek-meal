import React from 'react';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';
import {
  Home,
  Users,
  MapPin,
  Component,
  Soup,
  Backpack,
  Settings,
  Tags,
  Utensils,
  Layers,
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
];

const categoriesNavigation = [
  { path: '/categories', label: 'Категории продуктов', icon: Tags },
  { path: '/meal-types', label: 'Типы приемов пищи', icon: Utensils },
  { path: '/equipment-categories', label: 'Категории снаряжения', icon: Layers },
];

const settingsNavigation = [{ path: '/settings', label: 'Настройки', icon: Settings }];

const NavLinkItem = ({
  item,
  isActive,
  isNested = false,
}: {
  item: any;
  isActive: boolean;
  isNested?: boolean;
}) => (
  <NavLink
    to={item.path}
    className={cn(
      'group flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
      'notion-bg-hover notion-focus-ring',
      isNested ? 'py-1.5 pr-3 pl-9' : 'px-3 py-2',
      isActive
        ? 'bg-muted/80 text-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    )}
    end
  >
    <item.icon className="w-4 h-4" />
    <span>{item.label}</span>
  </NavLink>
);

const Sidebar = ({ isSidebarOpen, location }: { isSidebarOpen: boolean; location: any }) => {
  return (
    <aside
      className={cn(
        'bg-background/70 backdrop-blur-xl border-r notion-border-subtle flex-col flex-shrink-0 transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'w-64 p-4' : 'w-0 p-0 overflow-hidden'
      )}
    >
      <nav className="flex-grow space-y-4">
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
            Основные
          </h3>
          {mainNavigation.map((item) => (
            <NavLinkItem key={item.path} item={item} isActive={location.pathname === item.path} />
          ))}
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
            Базы данных
          </h3>
          {dbNavigation.map((item) => (
            <NavLinkItem key={item.path} item={item} isActive={location.pathname === item.path} />
          ))}
        </div>

        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2 mt-4">
            Категории
          </h3>
          {categoriesNavigation.map((item) => (
            <NavLinkItem key={item.path} item={item} isActive={location.pathname === item.path} />
          ))}
        </div>
      </nav>

      <div className="mt-auto">
        {settingsNavigation.map((item) => (
          <NavLinkItem key={item.path} item={item} isActive={location.pathname === item.path} />
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
