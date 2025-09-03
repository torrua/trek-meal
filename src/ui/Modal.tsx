// src/ui/Modal.tsx

import React from 'react';
import cn from 'classnames';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl'; // --- ИЗМЕНЕНИЕ: Добавлен prop size
}

const sizeClasses = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'bg-card text-card-foreground rounded-lg border border-border shadow-lg w-full max-h-[90vh] flex flex-col',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            &times;
          </button>
        </header>
        <main className="p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Modal;
