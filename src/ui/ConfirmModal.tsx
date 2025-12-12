// src/ui/ConfirmModal.tsx

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'secondary';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-sm text-muted-foreground">{children}</div>
      <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button type="button" variant={variant} onClick={onConfirm} disabled={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
