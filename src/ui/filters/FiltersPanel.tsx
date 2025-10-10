// src/ui/filters/FiltersPanel.tsx
import React from 'react';
import cn from 'classnames';
import DropdownSelect from '../../ui/DropdownSelect';

export type SelectField = {
  type: 'select';
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: { value: string; label: string }[];
};

export type FilterField = SelectField; // extend in future
export type MultiSelectField = {
  type: 'multiselect';
  name: string;
  label: string;
  options: { value: string; label: string; emoji?: string; color?: string }[];
};

export type AnyField = FilterField | MultiSelectField;

export interface FiltersPanelProps<TValues extends object> {
  values: TValues;
  onChange: (next: Partial<TValues>) => void;
  fields: AnyField[];
  className?: string;
  title?: string;
  showReset?: boolean;
}

const FiltersPanel = <TValues extends object>({
  values,
  onChange,
  fields,
  className,
  title = 'Фильтры',
  showReset = true,
}: FiltersPanelProps<TValues>) => {
  const v = values as unknown as Record<string, unknown>;
  const isActiveValue = (val: unknown) => {
    if (Array.isArray(val)) return val.length > 0;
    return val !== 'all';
  };
  const hasActive = Object.values(v).some((val) => isActiveValue(val));
  const activeCount = Object.values(v).filter((val) => isActiveValue(val)).length;

  const handleFieldChange = (name: string, value: string) => {
    onChange({ [name]: value } as Partial<TValues>);
  };

  const handleReset = () => {
    const reset: Record<string, unknown> = {};
    Object.entries(v).forEach(([k, val]) => {
      reset[k] = Array.isArray(val) ? [] : 'all';
    });
    onChange(reset as Partial<TValues>);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {hasActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {activeCount}
            </span>
          )}
        </div>
        {showReset && hasActive && (
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors self-start sm:self-auto px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            Сбросить все
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <DropdownSelect
                key={field.name}
                label={field.label}
                icon={field.icon}
                options={field.options}
                value={String((v[field.name] as string | undefined) ?? 'all')}
                onChange={(value) => handleFieldChange(field.name, value as string)}
                isActive={isActiveValue(v[field.name])}
              />
            );
          }
          if (field.type === 'multiselect') {
            const selectedIds = (v[field.name] as string[] | undefined) ?? [];
            return (
              <DropdownSelect
                key={field.name}
                label={field.label}
                icon={({ className }) => <span className={cn('w-3.5 h-3.5', className)} />}
                options={field.options}
                value={selectedIds}
                onChange={(val) => {
                  const ids = Array.isArray(val) ? val : [val];
                  onChange({ [field.name]: ids } as Partial<TValues>);
                }}
                isActive={selectedIds.length > 0}
                isMulti
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default FiltersPanel;
