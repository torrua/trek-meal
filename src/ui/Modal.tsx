// src/ui/Modal.tsx - Notion-style modal

import React from 'react';
import cn from 'classnames';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with Notion-style blur */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 animate-notion-fade"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'bg-white dark:bg-dark-secondary rounded-notion-lg',
            'border border-border dark:border-dark-border',
            'shadow-notion-xl w-full max-h-[85vh] flex flex-col',
            'pointer-events-auto animate-notion-fade',
            sizeClasses[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-dark-border flex-shrink-0">
            <h2 className="text-notion-lg font-semibold text-foreground dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-notion-sm text-muted-foreground hover:text-foreground 
                         dark:hover:text-white hover:bg-muted dark:hover:bg-dark-tertiary 
                         transition-all duration-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 notion-scrollbar">{children}</main>
        </div>
      </div>
    </>
  );
};

export default Modal;
