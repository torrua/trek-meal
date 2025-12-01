// src/components/meal-types/CreateMealTypeButton.tsx
import React from 'react';
import { CirclePlus } from 'lucide-react';
import Button from '../../ui/Button';

interface CreateMealTypeButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

const CreateMealTypeButton: React.FC<CreateMealTypeButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'default',
  className = '',
  showText = true,
  disabled = false,
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      <CirclePlus className="w-4 h-4 sm:mr-2" />
      {showText && <span className="hidden sm:inline">Добавить тип</span>}
    </Button>
  );
};

export default CreateMealTypeButton;
