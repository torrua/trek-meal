// src/ui/DropdownSelect.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import cn from 'classnames';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DropdownSelectProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  disabled?: boolean;
  isActive?: boolean; // --- НОВЫЙ PROP ---
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  containerClassName,
  disabled = false,
  isActive = false, // --- ЗНАЧЕНИЕ ПО УМОЛЧАНИЮ ---
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={cn('space-y-1.5', containerClassName)} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          // --- ИЗМЕНЕНИЕ: Логика стиля теперь зависит от пропа isActive ---
          className={cn(
            'flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all hover:shadow-sm text-left shadow-sm',
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            disabled ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : ''
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Icon
              className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-blue-500' : 'text-gray-400')}
            />
            <span
              className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              )}
            >
              {selectedOption ? selectedOption.label : label}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform flex-shrink-0 text-gray-400',
              isOpen ? 'rotate-180' : ''
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-2 min-w-full w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 animate-fade-in">
            {options.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3',
                  value === option.value
                    ? 'font-semibold text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
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
      </div>
    </div>
  );
};

export default DropdownSelect;
