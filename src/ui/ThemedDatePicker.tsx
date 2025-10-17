// src/ui/ThemedDatePicker.tsx

import React, { forwardRef } from 'react';
import DatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Input from './Input';
import { Calendar } from 'lucide-react';

// Стили для самого календаря (popup)
const datePickerStyles = `
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker {
    font-family: inherit;
    border-radius: var(--notion-radius-md);
    border-color: var(--datepicker-border);
    background-color: var(--datepicker-bg);
    box-shadow: var(--notion-shadow-lg);
  }
  .react-datepicker__header {
    background-color: var(--datepicker-header-bg);
    border-bottom-color: var(--datepicker-border);
    border-top-left-radius: var(--notion-radius-md);
    border-top-right-radius: var(--notion-radius-md);
  }
  .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name {
    color: var(--datepicker-text);
    font-weight: 500;
  }
  .react-datepicker__day {
    color: var(--datepicker-text);
  }
  .react-datepicker__day:hover {
    background-color: var(--datepicker-hover-bg);
    border-radius: var(--notion-radius-sm);
  }
  .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range {
    background-color: var(--primary);
    color: var(--primary-foreground);
    border-radius: var(--notion-radius-sm);
  }
  .react-datepicker__day--keyboard-selected {
    background-color: var(--primary);
    color: var(--primary-foreground);
    border-radius: var(--notion-radius-sm);
  }
  .react-datepicker__triangle {
    display: none;
  }
  .react-datepicker__navigation-icon::before {
    border-color: var(--datepicker-text);
  }
`;

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ value, onClick, onChange }, ref) => (
    <Input onClick={onClick} ref={ref} value={value} icon={Calendar} readOnly onChange={onChange} />
  )
);

CustomDateInput.displayName = 'CustomDateInput';

const ThemedDatePicker: React.FC<ReactDatePickerProps> = (props) => {
  const themeVariables = `
    :root {
      --datepicker-bg: var(--card);
      --datepicker-border: var(--border);
      --datepicker-text: var(--foreground);
      --datepicker-header-bg: var(--muted);
      --datepicker-hover-bg: var(--muted);
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
