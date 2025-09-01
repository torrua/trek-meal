// src/constants/participants.ts

import { Users, User, Baby, MapPin, Zap, Star, Award } from 'lucide-react';

export const GENDER_OPTIONS = [
  { value: 'all', label: 'Все', icon: Users },
  { value: 'male', label: 'Мужской', icon: User },
  { value: 'female', label: 'Женский', icon: User },
];

export const AGE_OPTIONS = [
  { value: 'all', label: 'Все возрасты', icon: Users },
  { value: 'adult', label: 'Взрослые', icon: User },
  { value: 'child', label: 'Дети', icon: Baby },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'Любой опыт', icon: Users },
  { value: 'beginner', label: 'Новичок', icon: Zap },
  { value: 'experienced', label: 'Опытный', icon: Star },
  { value: 'professional', label: 'Профессионал', icon: Award },
];

export const TRIPS_OPTIONS = [
  { value: 'all', label: 'Все участники', icon: MapPin },
  { value: 'with_trips', label: 'С походами', icon: MapPin },
  { value: 'without_trips', label: 'Без походов', icon: MapPin },
];

export const EXPERIENCE_CONFIG = {
  beginner: {
    label: 'Новичок',
    className:
      'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
  },
  experienced: {
    label: 'Опытный',
    className:
      'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  },
  professional: {
    label: 'Профессионал',
    className:
      'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  },
};

export const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Легкий',
    className:
      'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
  },
  medium: {
    label: 'Средний',
    className:
      'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  },
  hard: {
    label: 'Сложный',
    className:
      'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  },
};
