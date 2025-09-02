// src/ui/ThemedDatePicker.tsx

import React, { forwardRef } from 'react';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useThemeStore from '../stores/useThemeStore';
import Input from './Input';
import { Calendar } from 'lucide-react';

// Стили для самого календаря (popup)
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker {
    font-family: inherit;
    border-radius: 0.75rem;
    border-color: var(--datepicker-border);
    background-color: var(--datepicker-bg);
  }
  .react-datepicker__header {
    background-color: var(--datepicker-header-bg);
    border-bottom-color: var(--datepicker-border);
  }
  .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name {
    color: var(--datepicker-text);
  }
  .react-datepicker__day {
    color: var(--datepicker-text);
  }
  .react-datepicker__day:hover {
    background-color: var(--datepicker-hover-bg);
    border-radius: 9999px;
  }
  .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range {
    background-color: #1d4ed8;
    color: white;
    border-radius: 9999px;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #3b82f6;
    color: white;
    border-radius: 9999px;
  }
  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__navigation-icon::before {
    border-color: var(--datepicker-text);
  }
`;

// --- ИЗМЕНЕНИЕ: Типизация пропсов уточнена ---
interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange }, ref) => (
    <Input
      onClick={onClick}
      ref={ref}
      value={value}
      icon={Calendar}
      readOnly // Предотвращаем ручной ввод
      onChange={onChange} // Нужно для работы isClearable
    />
  )
);

// --- ИЗМЕНЕНИЕ: Добавлено displayName ---
CustomDateInput.displayName = 'CustomDateInput';

const ThemedDatePicker: React.FC<ReactDatePickerProps> = (props) => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const themeVariables = `
    :root {
      --datepicker-bg: ${isDark ? '#1f2937' : '#ffffff'};
      --datepicker-border: ${isDark ? '#4b5563' : '#d1d5db'};
      --datepicker-text: ${isDark ? '#f9fafb' : '#111827'};
      --datepicker-header-bg: ${isDark ? '#374151' : '#f3f4f6'};
      --datepicker-hover-bg: ${isDark ? '#4b5563' : '#e5e7eb'};
    }
  `;

  return (
    <>
      <style>{themeVariables + datePickerStyles}</style>
      <DatePicker
        {...props}
        dateFormat="dd.MM.yyyy"
        placeholderText="Выберите даты"
        customInput={<CustomDateInput />}
      />
    </>
  );
};

export default ThemedDatePicker;
