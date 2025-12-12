// src/ui/Modal.tsx

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import cn from 'classnames';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

// Modal size variants
const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw] w-[95vw]',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Enhanced backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content with refined styling */}
      <div
        className={cn(
          'relative bg-card rounded-2xl border border-border shadow-xl',
          'w-full max-h-[90vh] flex flex-col overflow-hidden',
          'animate-in zoom-in-95',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header with refined spacing */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border/60">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-foreground tracking-tight leading-tight"
            >
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg text-muted-foreground hover:text-foreground',
                  'hover:bg-muted/60',
                  'focus:ring focus:ring-offset-2 focus:ring-primary-foreground'
                )}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content with refined padding */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.getElementById('root-portal') || document.body
  );
};

export default Modal;
