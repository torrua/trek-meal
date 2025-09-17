// src/ui/DropdownSelect.tsx

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import cn from 'classnames';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface DropdownSelectProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  disabled?: boolean;
  isActive?: boolean;
  placeholder?: string;
  'data-testid'?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  options = [],
  value,
  onChange,
  icon: Icon,
  containerClassName,
  disabled = false,
  isActive = false,
  placeholder,
  'data-testid': testId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [minMenuWidth, setMinMenuWidth] = useState(0);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          // Navigate to next option
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Navigate to previous option
          break;
      }
    },
    [isOpen]
  );

  const handleOptionSelect = useCallback(
    (optionValue: string) => {
      const option = options.find((opt) => opt.value === optionValue);
      if (option && !option.disabled) {
        onChange(optionValue);
        setIsOpen(false);
      }
    },
    [options, onChange]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleOutsideClick, handleKeyDown]);

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      setMinMenuWidth(triggerRef.current.offsetWidth);
    }
  }, [isOpen]);

  return (
    <div className={cn('space-y-2', containerClassName)} ref={dropdownRef} data-testid={testId}>
      <label className="block text-sm font-medium text-foreground tracking-tight">{label}</label>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            // Base Notion-style button
            'flex items-center justify-between w-full px-4 py-3 text-left rounded-lg border transition-all duration-200',
            'notion-focus-ring notion-shadow-sm hover:notion-shadow',
            'min-w-[220px]',

            // Active/inactive states
            isActive
              ? 'bg-primary/5 border-primary/30 text-primary'
              : 'bg-card border notion-border-subtle hover:border-border text-foreground',

            // Disabled state
            disabled && 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60',

            // Open state
            isOpen && 'border-primary/50 ring-2 ring-primary/20'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`${label}: ${selectedOption?.label || placeholder || 'Не выбрано'}`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Icon with Notion-style background */}
            <div
              className={cn(
                'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center',
                'bg-muted/50 border notion-border-subtle',
                isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            <span
              className={cn(
                'text-sm font-medium truncate',
                !selectedOption && 'text-muted-foreground'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder || 'Выберите опцию'}
            </span>
          </div>

          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform duration-200 flex-shrink-0 text-muted-foreground ml-2',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            style={{ minWidth: `${minMenuWidth}px` }}
            className={cn(
              'absolute z-50 top-full left-0 mt-2 w-max max-w-xs',
              'bg-card border notion-border-subtle rounded-xl notion-shadow-lg',
              'py-2 overflow-hidden notion-scale-in'
            )}
            role="listbox"
            aria-label={label}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => handleOptionSelect(option.value)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-all duration-150 flex items-center gap-3',
                    'notion-bg-hover',
                    value === option.value && 'bg-primary/10 text-primary font-semibold',
                    option.disabled && 'text-muted-foreground/50 cursor-not-allowed',
                    !option.disabled &&
                      !value === option.value &&
                      'text-foreground hover:text-foreground'
                  )}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {/* Option icon */}
                  {option.icon ? (
                    <option.icon className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                  )}

                  {/* Option label */}
                  <div className="flex-1 truncate font-medium">{option.label}</div>

                  {/* Selected indicator */}
                  {value === option.value && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">Нет доступных опций</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelect;
