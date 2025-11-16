// src/ui/DropdownSelect.tsx

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import cn from 'classnames';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface DropdownSelectProps {
  label?: string;
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  icon: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  disabled?: boolean;
  isActive?: boolean;
  placeholder?: string;
  'data-testid'?: string;
  isMulti?: boolean;
  searchable?: boolean; // Add searchable prop
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
  isMulti = false,
  searchable = false, // Default to false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [minMenuWidth, setMinMenuWidth] = useState(0);
  const [searchTerm, setSearchTerm] = useState(''); // Add search term state

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedValues = useMemo(() => (Array.isArray(value) ? value : [value]), [value]);
  const selectedOption = !isMulti ? options.find((opt) => opt.value === (value as string)) : null;

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm(''); // Clear search when closing
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          setSearchTerm(''); // Clear search when closing
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
      if (!option || option.disabled) return;

      if (isMulti) {
        const current = new Set(selectedValues);
        if (current.has(optionValue)) {
          current.delete(optionValue);
        } else {
          current.add(optionValue);
        }
        onChange(Array.from(current));
        // keep menu open for multi-select
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm(''); // Clear search when selecting
      }
    },
    [options, onChange, isMulti, selectedValues]
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  return (
    <div className={cn('space-y-2', containerClassName)} ref={dropdownRef} data-testid={testId}>
      {label && (
        <label className="block text-sm font-medium text-foreground tracking-tight">{label}</label>
      )}

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
            // Base Notion-style button - matches Input height
            'flex items-center justify-between w-full h-10 px-4 py-2 text-left rounded-lg border transition-all duration-200',
            'notion-focus-ring',
            'min-w-[220px]',

            // Active/inactive states
            isActive
              ? 'bg-primary/5 border-primary/30 text-primary'
              : 'bg-background border-border hover:border-border-hover text-foreground',

            // Disabled state
            disabled && 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60',

            // Open state
            isOpen && 'border-primary/60 ring-2 ring-primary/20 bg-card'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={`${label}: ${
            isMulti
              ? selectedValues.length > 0 &&
                !(selectedValues.length === 1 && selectedValues[0] === '')
                ? `Выбрано ${selectedValues.length}`
                : placeholder || 'Не выбрано'
              : selectedOption?.label || placeholder || 'Не выбрано'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Icon - simplified to match Input style */}
            <Icon
              className={cn(
                'w-4 h-4 flex-shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />

            {isMulti ? (
              <span
                className={cn(
                  'text-sm font-medium truncate',
                  selectedValues.length === 0 && 'text-muted-foreground'
                )}
              >
                {selectedValues.length > 0
                  ? `Выбрано ${selectedValues.length}`
                  : placeholder || 'Выберите опции'}
              </span>
            ) : (
              <span
                className={cn(
                  'text-sm font-medium truncate',
                  !selectedOption && 'text-muted-foreground'
                )}
              >
                {selectedOption ? selectedOption.label : placeholder || 'Выберите опцию'}
              </span>
            )}
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
              'absolute z-[9999] top-full left-0 mt-2 w-max max-w-xs',
              'bg-card border border-border rounded-xl notion-shadow-lg',
              'py-2 overflow-hidden notion-scale-in'
            )}
            role="listbox"
            aria-label={label}
          >
            {/* Search Input */}
            {searchable && (
              <div className="px-2 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/60"
                  />
                </div>
              </div>
            )}

            <div className="max-h-[320px] overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const checked = isMulti
                    ? selectedValues.includes(option.value)
                    : (value as string) === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full px-4 py-2.5 text-left text-sm transition-all duration-150 flex items-center gap-3',
                        'notion-bg-hover',
                        checked && 'bg-primary/10 text-primary font-semibold',
                        option.disabled && 'text-muted-foreground/50 cursor-not-allowed',
                        !option.disabled && 'text-foreground hover:text-foreground'
                      )}
                      role="option"
                      aria-selected={checked}
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
                      {checked && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Ничего не найдено' : 'Нет доступных опций'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSelect;
