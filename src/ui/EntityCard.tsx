import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { MoreHorizontal } from 'lucide-react';
import DropdownMenu from './DropdownMenu';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

interface DetailItem {
  key: string;
  icon: React.ElementType;
  text: string | number;
  title?: string;
  className?: string;
}

interface EntityCardProps {
  title: string;
  subtitle?: React.ReactNode;
  icon: React.ElementType;
  iconColor?: string;
  details?: DetailItem[];
  menuItems?: MenuItem[];
  isSelected?: boolean;
  onSelect?: () => void;
  borderColor?: string;
  className?: string;
  'data-testid'?: string;
  linkTo?: string;
  description?: string;
}

const EntityCard: React.FC<EntityCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  details,
  menuItems,
  isSelected,
  onSelect,
  borderColor,
  className,
  'data-testid': testId,
  linkTo,
  description,
}) => {
  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              iconColor ? `bg-${iconColor}/10` : 'bg-primary/10'
            )}
          >
            <Icon className={cn('w-5 h-5', iconColor ? `text-${iconColor}` : 'text-primary')} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate" title={title}>
              {title}
            </h3>
            {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
            )}
          </div>
        </div>
        {menuItems && menuItems.length > 0 && (
          <DropdownMenu
            items={menuItems}
            trigger={
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
          />
        )}
      </div>
      {details && details.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {details.map((item) => (
              <div key={item.key} className="flex items-center gap-1.5" title={item.title}>
                <item.icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <dt className="sr-only">{item.key}</dt>
                <dd className={cn('text-foreground truncate', item.className)}>{item.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </>
  );

  const cardClasses = cn(
    'block p-3 rounded-xl border-2 transition-all duration-200 notion-border-semitransparent',
    'hover:notion-shadow-sm hover:border-primary/50',
    {
      'border-primary bg-primary/5 hover:bg-primary/10': isSelected,
      'bg-card border-transparent': !isSelected,
    },
    borderColor,
    className
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={cardClasses} data-testid={testId}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className={cardClasses}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.();
        }
      }}
      role="button"
      tabIndex={onSelect ? 0 : -1}
      aria-pressed={isSelected}
      data-testid={testId}
    >
      {cardContent}
    </div>
  );
};

export default EntityCard;
