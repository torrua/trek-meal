// src/ui/ThemedDatePicker.tsx

import React from 'react';
import DatePicker, { DatePickerProps, registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
// --- ИСПРАВЛЕНИЕ: Убираем неиспользуемый импорт ---
// import useThemeStore from '../stores/useThemeStore';

registerLocale('ru', ru);

const DateInput = React.forwardRef<HTMLInputElement, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <input
      value={value}
      onClick={onClick}
      ref={ref}
      readOnly
      className="w-full h-10 px-3 cursor-pointer bg-secondary border border-primary text-primary rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      placeholder="Выберите период"
    />
  )
);
DateInput.displayName = 'DateInput';

const ThemedDatePicker: React.FC<DatePickerProps> = (props) => {
  // --- ИСПРАВЛЕНИЕ: Убираем неиспользуемую переменную ---
  // const { theme } = useThemeStore();

  return <DatePicker locale="ru" dateFormat="dd.MM.yyyy" customInput={<DateInput />} {...props} />;
};

export default ThemedDatePicker;
