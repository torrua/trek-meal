// src/ui/DropdownMenu.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

      setPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.right + scrollLeft - 192,
      });
    }
  }, []);

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

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', calculatePosition);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [isOpen, handleOutsideClick, calculatePosition]);

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
        'fixed w-48 origin-top-right rounded-notion-lg bg-card shadow-notion-lg ring-1 ring-border focus:outline-none z-[9999]',
        'animate-fade-in'
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      <div className="p-1" role="none" onClick={() => setIsOpen(false)}>
        {children}
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
