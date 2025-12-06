// src/components/meals/CreateMealButton.tsx
import React from 'react';
import { CirclePlus } from 'lucide-react';
import Button from '../../ui/Button';

interface CreateMealButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

const CreateMealButton: React.FC<CreateMealButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'default',
  className = '',
  showText = true,
  disabled = false,
}) => {
  // If showText is false, we should use icon size
  const effectiveSize = !showText ? 'icon' : size;

  return (
    <Button
      variant={variant}
      size={effectiveSize}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      <CirclePlus className="w-4 h-4" />
      {showText && <span className="hidden sm:inline">Создать приём пищи</span>}
    </Button>
  );
};

export default CreateMealButton;
