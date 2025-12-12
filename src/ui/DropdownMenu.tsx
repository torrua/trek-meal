// src/ui/DropdownMenu.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';

export interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: MenuItem[];
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (triggerRef.current && menuRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      let top = scrollTop;
      let left = scrollLeft;

      // Calculate vertical position
      if (side === 'bottom') {
        top += rect.bottom + 8;
      } else {
        top += rect.top - menuRect.height - 8;
      }

      // Calculate horizontal position
      if (align === 'end') {
        left += rect.right - menuRect.width;
      } else {
        left += rect.left;
      }

      // Ensure menu stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left + menuRect.width > viewportWidth) {
        left = viewportWidth - menuRect.width - 8;
      }
      if (left < 8) {
        left = 8;
      }

      if (top + menuRect.height > viewportHeight) {
        top = rect.top + scrollTop - menuRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [align, side]);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      triggerRef.current &&
      !triggerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const handleItemClick = (item: MenuItem) => (e: React.MouseEvent) => {
    if (!item.disabled) {
      item.onClick(e);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Calculate position after menu is rendered
      setTimeout(calculatePosition, 0);

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen, handleOutsideClick, handleKeyDown, calculatePosition]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const renderTrigger = () => {
    if (React.isValidElement(trigger)) {
      return React.cloneElement(
        trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>,
        {
          onClick: (e: React.MouseEvent) => {
            const triggerElement = trigger as React.ReactElement<{
              onClick?: React.MouseEventHandler;
            }>;
            triggerElement.props.onClick?.(e);
            handleTriggerClick(e);
          },
        }
      );
    }
    return trigger;
  };

  const menu = isOpen ? (
    <div
      ref={menuRef}
      className="fixed z-50 bg-card text-foreground rounded-lg shadow-lg border border-border p-1 min-w-[180px] animate-in fade-in-0 zoom-in-95"
      style={{ top: position.top, left: position.left }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="menu-button"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={handleItemClick(item)}
          disabled={item.disabled}
          className={cn(
            'w-full text-left flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors',
            'hover:bg-muted focus:bg-muted focus:outline-none',
            'disabled:opacity-50 disabled:pointer-events-none',
            item.className
          )}
          role="menuitem"
        >
          <item.icon className="w-4 h-4 text-muted-foreground" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  ) : null;

  return (
    <>
      <div ref={triggerRef}>{renderTrigger()}</div>
      {menu && createPortal(menu, document.body)}
    </>
  );
};

export default DropdownMenu;
