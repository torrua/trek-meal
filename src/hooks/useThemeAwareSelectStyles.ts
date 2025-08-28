// src/hooks/useThemeAwareSelectStyles.ts

import { useMemo } from 'react';
import { StylesConfig, GroupBase } from 'react-select';
import useThemeStore from '../stores/useThemeStore';

export const useThemeAwareSelectStyles = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>() => {
  const { theme } = useThemeStore();

  const styles: StylesConfig<Option, IsMulti, Group> = useMemo(() => {
    const isDark = theme === 'dark';

    const colors = {
      bgSecondary: isDark ? '#111827' : '#ffffff',
      bgMuted: isDark ? '#1f2937' : '#f3f4f6',
      borderPrimary: isDark ? '#374151' : '#d1d5db',
      textPrimary: isDark ? '#f9fafb' : '#111827',
      textMuted: isDark ? '#9ca3af' : '#6b7280',
      blue600: '#2563eb',
      blue700: '#1d4ed8',
    };

    return {
      control: (base) => ({
        ...base,
        backgroundColor: colors.bgSecondary,
        borderColor: colors.borderPrimary,
        boxShadow: 'none',
        '&:hover': {
          borderColor: colors.blue600,
        },
      }),
      input: (base) => ({
        ...base,
        color: colors.textPrimary,
      }),
      singleValue: (base) => ({
        ...base,
        color: colors.textPrimary,
      }),
      placeholder: (base) => ({
        ...base,
        color: colors.textMuted,
      }),
      menu: (base) => ({
        ...base,
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.borderPrimary}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }),
      option: (base, { isFocused, isSelected }) => ({
        ...base,
        backgroundColor: isSelected ? colors.blue700 : isFocused ? colors.bgMuted : 'transparent',
        color: isSelected ? 'white' : colors.textPrimary,
        '&:active': {
          backgroundColor: colors.blue700,
        },
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: colors.bgMuted,
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: colors.textPrimary,
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: colors.textMuted,
        '&:hover': {
          backgroundColor: colors.blue700,
          color: 'white',
        },
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 9999, // Очень высокий z-index, чтобы быть поверх модалки
      }),
    };
  }, [theme]);

  return styles;
};
