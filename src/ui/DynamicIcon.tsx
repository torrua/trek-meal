// src/ui/DynamicIcon.tsx

import React from 'react';
import * as icons from 'lucide-react';

// Определяем тип для объекта иконок
// Ключ - строка, значение - React-компонент с определенными пропсами
type IconCollection = {
  [key: string]: React.ComponentType<icons.LucideProps>;
};

// Приводим импортированный объект к нашему типу
const LucideIcons = icons as IconCollection;

interface DynamicIconProps extends icons.LucideProps {
  name: string;
}

const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = LucideIcons[name];

  if (!IconComponent) {
    // Возвращаем иконку по умолчанию, если запрошенная не найдена
    // Иконка HelpCircle точно существует, так как мы ее импортировали
    return <icons.HelpCircle {...props} />;
  }

  return <IconComponent {...props} />;
};

export default DynamicIcon;
