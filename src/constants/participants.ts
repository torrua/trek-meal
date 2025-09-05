import { Users, User, Baby, MapPin, Zap, Star, Award } from 'lucide-react';

export const GENDER_CONFIG = {
  male: {
    icon: User,
    color: '#3b82f6', // blue-500
  },
  female: {
    icon: User,
    color: '#ec4899', // pink-500
  },
};

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
    icon: Zap,
    colorClassName: 'text-green-600 dark:text-green-400',
  },
  experienced: {
    label: 'Опытный',
    icon: Star,
    colorClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  professional: {
    label: 'Профессионал',
    icon: Award,
    colorClassName: 'text-red-600 dark:text-red-400',
  },
};
