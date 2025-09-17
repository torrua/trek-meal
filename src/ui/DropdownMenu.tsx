// src/ui/DropdownMenu.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
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

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        // Return focus to trigger
        if (triggerRef.current) {
          const button = triggerRef.current.querySelector('button');
          button?.focus();
        }
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      // Calculate position after menu is rendered
      setTimeout(calculatePosition, 0);

      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen, handleOutsideClick, handleEscape, calculatePosition]);

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
            trigger.props.onClick?.(e);
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
      className={cn(
        'fixed min-w-48 origin-top-right rounded-xl bg-card border notion-border-subtle notion-shadow-lg z-[9999]',
        'notion-scale-in',
        'overflow-hidden'
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="py-2" role="none" onClick={() => setIsOpen(false)}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<{ className?: string }>;
            return React.cloneElement(childElement, {
              ...childElement.props,
              className: cn(childElement.props.className),
            });
          }
          return child;
        })}
      </div>
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
