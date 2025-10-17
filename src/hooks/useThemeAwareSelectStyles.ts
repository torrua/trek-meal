// src/hooks/useThemeAwareSelectStyles.ts

import { useMemo } from 'react';
import { StylesConfig, GroupBase } from 'react-select';

export const useThemeAwareSelectStyles = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>() => {
  const styles: StylesConfig<Option, IsMulti, Group> = useMemo(() => {
    const colors = {
      bgSecondary: '#ffffff',
      bgMuted: '#f3f4f6',
      borderPrimary: '#d1d5db',
      textPrimary: '#111827',
      textMuted: '#6b7280',
      blue600: '#2563eb',
      blue700: '#1d4ed8',
    };

    return {
      control: (base) => ({
        ...base,
        minHeight: '40px',
        height: '40px',
        backgroundColor: colors.bgSecondary,
        borderColor: colors.borderPrimary,
        boxShadow: 'none',
        borderRadius: '0.5rem',
        '&:hover': {
          borderColor: colors.blue600,
        },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: '0 16px',
        height: '40px',
      }),
      input: (base) => ({
        ...base,
        color: colors.textPrimary,
        margin: '0',
        padding: '0',
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
        // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
        width: 'auto', // Позволяет меню подстраиваться под ширину контента
        minWidth: '100%', // Гарантирует, что меню не будет уже, чем инпут
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
        zIndex: 9999,
      }),
    };
  }, []);

  return styles;
};
