// src/ui/DropdownMenu.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import cn from 'classnames';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, handleOutsideClick]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const renderTrigger = () => {
    if (React.isValidElement(trigger)) {
      // Явно указываем тип пропсов для TypeScript
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

  return (
    <div className="relative" ref={menuRef}>
      {renderTrigger()}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-card shadow-lg ring-1 ring-border focus:outline-none z-20',
            'animate-fade-in'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-1" role="none" onClick={() => setIsOpen(false)}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, {
                    ...child.props,
                    className: cn(child.props.className, 'rounded-md'),
                  })
                : child
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
