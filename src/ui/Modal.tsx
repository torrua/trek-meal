// src/ui/Modal.tsx

import React, { useEffect } from 'react';
import cn from 'classnames';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Notion-style backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative bg-card rounded-2xl border notion-border-subtle notion-shadow-lg',
          'w-full max-h-[85vh] flex flex-col overflow-hidden',
          'notion-scale-in',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-5 border-b notion-border-subtle">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-1.5 rounded-lg text-muted-foreground hover:text-foreground',
                  'hover:bg-muted/60 transition-all duration-200',
                  'notion-focus-ring'
                )}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto notion-scrollbar">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
