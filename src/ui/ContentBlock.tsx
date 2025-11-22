// src/ui/ContentBlock.tsx

import React from 'react';
import cn from 'classnames';

interface ContentBlockProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
  headerContent?: React.ReactNode;
  variant?: 'default' | 'orange' | 'blue' | 'purple' | 'green';
  className?: string;
}

const ContentBlock: React.FC<ContentBlockProps> = ({
  title,
  icon: Icon,
  children,
  actionButton,
  headerContent,
  variant = 'default',
  className,
}) => {
  const gradients = {
    default: 'from-blue-500/5 via-purple-500/5 to-pink-500/5',
    blue: 'from-blue-500/5 via-cyan-500/5 to-teal-500/5',
    orange: 'from-orange-500/5 via-amber-500/5 to-yellow-500/5',
    purple: 'from-purple-500/5 via-pink-500/5 to-rose-500/5',
    green: 'from-emerald-500/5 via-green-500/5 to-lime-500/5',
  };

  const iconColors = {
    default: 'text-primary',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
  };

  return (
    <div
      className={cn(
        'rounded-xl border border-border overflow-hidden',
        `bg-gradient-to-br ${gradients[variant]}`,
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className={cn('w-4 h-4', iconColors[variant])} />
          </div>
          <h2 className="text-base font-semibold text-foreground truncate tracking-tight">
            {title}
          </h2>
          {headerContent && <div className="ml-2 flex-shrink-0">{headerContent}</div>}
        </div>

        {actionButton && (
          <div className="flex items-center gap-2 flex-shrink-0">{actionButton}</div>
        )}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

export default ContentBlock;
