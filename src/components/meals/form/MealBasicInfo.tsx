import React from 'react';
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form';
import { Tag } from 'lucide-react';
import Input from '../../../ui/Input';
import DropdownSelect from '../../../ui/DropdownSelect';
import Textarea from '../../../ui/Textarea';
import type { MealType } from '../../../types';

interface MealBasicInfoProps {
  control: Control<FieldValues> | Control<any>; // Разрешаем any для совместимости
  errors: FieldErrors<FieldValues> | FieldErrors<any>;
  mealTypes: MealType[];
  isNew?: boolean;
  nameRef?: React.RefObject<HTMLInputElement>;
}

const MealBasicInfo: React.FC<MealBasicInfoProps> = ({
  control,
  errors,
  mealTypes,
  isNew,
  nameRef,
}) => {
  return (
    <div className="space-y-4 pt-4">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            ref={(e) => {
              field.ref(e);
              if (nameRef && e) nameRef.current = e;
            }}
            label="Название"
            required
            type="text"
            placeholder="Название приёма пищи"
            autoFocus={isNew}
            error={errors.name?.message as string}
            // ДОБАВЛЕНО: block, чтобы убрать возможные отступы inline-элементов
            className="shadow-sm block"
          />
        )}
      />

      <Controller
        name="mealTypeId"
        control={control}
        render={({ field }) => (
          <DropdownSelect
            label="Тип"
            icon={Tag}
            options={[
              { value: '', label: 'Не указан' },
              ...mealTypes.map((type) => ({
                value: String(type.id),
                label: type.name,
              })),
            ]}
            value={field.value ? String(field.value) : ''}
            onChange={(val) => {
              const stringVal = Array.isArray(val) ? val[0] : val;
              field.onChange(stringVal);
            }}
            placeholder="Выберите тип приёма пищи"
            error={errors.mealTypeId?.message as string}
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            label="Описание"
            placeholder="Добавьте заметки или комментарии..."
            // ДОБАВЛЕНО: block, чтобы убрать "фантомный" отступ снизу (descender space)
            className="shadow-sm block"
          />
        )}
      />
    </div>
  );
};

export default MealBasicInfo;
