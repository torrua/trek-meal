// src/ui/DropdownSelect.tsx

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
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
  options = [], // ИСПРАВЛЕНИЕ: Значение по умолчанию
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
          // Логика навигации по опциям
          break;
        case 'ArrowUp':
          event.preventDefault();
          // Логика навигации по опциям
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
    <div className={cn('space-y-1.5', containerClassName)} ref={dropdownRef} data-testid={testId}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative inline-block text-left">
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
            'flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:shadow-sm text-left shadow-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500',
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : ''
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`${label}: ${selectedOption?.label || placeholder || 'Не выбрано'}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon
              className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-500' : 'text-gray-400')}
            />
            <span
              className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300',
                !selectedOption ? 'text-gray-400' : ''
              )}
            >
              {selectedOption ? selectedOption.label : placeholder || label}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform flex-shrink-0 text-gray-400',
              isOpen ? 'rotate-180' : ''
            )}
          />
        </button>
        {isOpen && options.length > 0 && (
          <div
            style={{ minWidth: `${minMenuWidth}px` }}
            className="absolute z-50 top-full left-0 mt-2 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 animate-fade-in"
            role="listbox"
            aria-label={label}
          >
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                disabled={option.disabled}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3',
                  value === option.value
                    ? 'font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30'
                    : option.disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300'
                )}
                role="option"
                aria-selected={value === option.value}
              >
                {option.icon ? (
                  <option.icon className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <span className="w-4" />
                )}
                <div className="flex-1 truncate">{option.label}</div>
                {value === option.value && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
        {isOpen && options.length === 0 && (
          <div className="absolute z-50 top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-4">
            <p className="text-sm text-gray-500 text-center px-4">Нет доступных опций</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelect;
