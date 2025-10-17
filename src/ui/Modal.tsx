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
      {/* Enhanced Notion-style backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal content with refined styling */}
      <div
        className={cn(
          'relative bg-card rounded-2xl border border-border notion-shadow-xl',
          'w-full max-h-[90vh] flex flex-col overflow-hidden',
          'notion-scale-in',
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
                  'hover:bg-muted/60 transition-all duration-200',
                  'notion-focus-ring flex-shrink-0'
                )}
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content with refined padding */}
        <div className="flex-1 overflow-y-auto notion-scrollbar">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.getElementById('root-portal')!
  );
};

export default Modal;
