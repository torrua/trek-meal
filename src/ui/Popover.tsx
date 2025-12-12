// src/ui/Popover.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import cn from 'classnames';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
}

const Popover: React.FC<PopoverProps> = ({ trigger, children, contentClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  return (
    <div className="relative" ref={popoverRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 origin-top-right rounded-lg bg-card shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20',
            'animate-fade-in p-4',
            contentClassName
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Popover;
