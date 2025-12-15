import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useId,
} from 'react';
import { ChevronDown, Check, Search, AlertCircle } from 'lucide-react';
import cn from 'classnames';

interface DropdownOption {
  value: string;
  label: string;
  menuLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface DropdownSelectProps {
  label?: string;
  description?: string;
  options: DropdownOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  icon: React.ComponentType<{ className?: string }>;
  containerClassName?: string;
  disabled?: boolean;
  isActive?: boolean;
  placeholder?: string;
  error?: string;
  'data-testid'?: string;
  isMulti?: boolean;
  searchable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  // ИЗМЕНЕНО: Добавлен проп required
  required?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  description,
  options = [],
  value,
  onChange,
  icon: Icon,
  containerClassName,
  disabled = false,
  isActive = false,
  placeholder,
  error,
  'data-testid': testId,
  isMulti = false,
  searchable = false,
  size = 'md',
  required = false, // По умолчанию false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [minMenuWidth, setMinMenuWidth] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const inputId = useId();

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const sizeClasses = {
    sm: 'h-8 text-xs px-3',
    md: 'h-10 text-sm px-4',
    lg: 'h-12 text-base px-4',
  };

  const iconSize = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const selectedValues = useMemo(() => (Array.isArray(value) ? value : [value]), [value]);
  const selectedOption = !isMulti ? options.find((opt) => opt.value === String(value)) : null;

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          setSearchTerm('');
          break;
        case 'ArrowDown':
          event.preventDefault();
          break;
        case 'ArrowUp':
          event.preventDefault();
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
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
        setTimeout(() => {
          triggerRef.current?.focus();
        }, 0);
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

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  return (
    <div
      className={cn('w-full space-y-1.5', containerClassName)}
      ref={dropdownRef}
      data-testid={testId}
    >
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
          {/* ИСПРАВЛЕНО: Звездочка отображается только если required=true */}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      {description && (
        <p id={`${inputId}-description`} className="text-xs text-muted-foreground mb-1.5">
          {description}
        </p>
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
            'flex w-full items-center transition-all duration-200 ease-in-out',
            'placeholder:text-muted-foreground text-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:ring-offset-0',
            'border border-border rounded-lg bg-card shadow-sm',
            sizeClasses[size as keyof typeof sizeClasses],
            'py-2',
            {
              'border-primary ring-1 ring-primary/20 ring-offset-0': isOpen,
              'ring-2 ring-danger border-transparent': error,
              'bg-muted/30 hover:bg-muted/50': disabled,
              'hover:border-border-hover': !disabled && !isOpen,
            }
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : description ? `${inputId}-description` : undefined
          }
          id={inputId}
          aria-label={`${label || 'Select'}: ${
            isMulti
              ? selectedValues.length > 0
                ? `Выбрано ${selectedValues.length}`
                : placeholder || 'Не выбрано'
              : selectedOption?.label || placeholder || 'Не выбрано'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {Icon && (
              <Icon
                className={cn(
                  iconSize[size as keyof typeof iconSize],
                  'flex-shrink-0',
                  isActive || isOpen ? 'text-primary' : 'text-muted-foreground',
                  error && 'text-danger'
                )}
              />
            )}

            <span className="min-w-0 flex-1 text-left">
              {isMulti ? (
                <span
                  className={cn('truncate', selectedValues.length === 0 && 'text-muted-foreground')}
                >
                  {selectedValues.length > 0
                    ? `Выбрано ${selectedValues.length}`
                    : placeholder || 'Выберите опции'}
                </span>
              ) : (
                <span
                  className={cn('truncate', {
                    'text-muted-foreground': !selectedOption,
                  })}
                >
                  {selectedOption ? selectedOption.label : placeholder || 'Выберите опцию'}
                </span>
              )}
            </span>

            <div className="flex items-center">
              {error && !isOpen && (
                <AlertCircle
                  className={cn(
                    iconSize[size as keyof typeof iconSize],
                    'text-danger mr-1.5 flex-shrink-0'
                  )}
                />
              )}
              <ChevronDown
                className={cn(
                  iconSize[size as keyof typeof iconSize],
                  'transition-transform duration-200 flex-shrink-0 text-muted-foreground',
                  isOpen && 'rotate-180',
                  error && 'text-danger'
                )}
                aria-hidden="true"
              />
            </div>
          </div>
        </button>

        {error && !isOpen && (
          <p className="text-sm text-danger mt-1 flex items-center gap-1.5">
            <span>{error}</span>
          </p>
        )}

        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-1',
              'bg-card rounded-lg shadow-lg border border-border',
              'shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]',
              'overflow-hidden animate-in fade-in-80 zoom-in-95',
              'ring-1 ring-black/5',
              'min-w-full',
              minMenuWidth ? 'w-[var(--min-menu-width)]' : 'w-auto',
              'max-h-[320px]'
            )}
            style={
              {
                '--min-menu-width': minMenuWidth ? `${minMenuWidth}px` : 'auto',
              } as React.CSSProperties
            }
          >
            {searchable && (
              <div className="p-2 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div
              className={cn('overflow-y-auto', searchable ? 'max-h-[264px]' : 'max-h-[320px]')}
              role="listbox"
              aria-label={label}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const checked = isMulti
                    ? selectedValues.includes(option.value)
                    : String(value) === String(option.value);

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(option.value);
                      }}
                      disabled={option.disabled}
                      className={cn(
                        `w-full px-4 py-2.5 text-left transition-colors duration-150 flex items-center gap-3 ${textSizeClasses[size as keyof typeof textSizeClasses]}`,
                        'focus:outline-none focus:bg-gray-200/80 dark:focus:bg-gray-700',
                        {
                          'bg-primary/15 text-primary font-medium': checked,
                          'text-muted-foreground/50 cursor-not-allowed': option.disabled,
                          'hover:bg-gray-200/80 dark:hover:bg-gray-700': !option.disabled,
                        }
                      )}
                      role="option"
                      aria-selected={checked ? 'true' : 'false'}
                    >
                      {option.icon ? (
                        <option.icon
                          className={cn(
                            iconSize[size as keyof typeof iconSize],
                            'flex-shrink-0',
                            checked ? 'text-primary' : 'text-muted-foreground',
                            option.disabled && 'opacity-50'
                          )}
                        />
                      ) : (
                        <div
                          className={cn(iconSize[size as keyof typeof iconSize], 'flex-shrink-0')}
                        />
                      )}

                      <div
                        className={cn('flex-1 truncate', {
                          'font-medium': checked,
                          'opacity-50': option.disabled,
                        })}
                      >
                        {option.menuLabel || option.label}
                      </div>

                      {checked && (
                        <Check
                          className={cn(
                            iconSize[size as keyof typeof iconSize],
                            'text-primary flex-shrink-0',
                            option.disabled && 'opacity-50'
                          )}
                        />
                      )}
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
