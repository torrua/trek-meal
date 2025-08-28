// src/constants/participants.ts

import { Award } from 'lucide-react';

export const PARTICIPANT_CONSTANTS = {
  GENDER_OPTIONS: [
    { value: 'male' as const, label: 'Мужской' },
    { value: 'female' as const, label: 'Женский' },
  ],
  AGE_OPTIONS: [
    { value: 'adult' as const, label: 'Взрослый' },
    { value: 'child' as const, label: 'Ребенок' },
  ],
  EXPERIENCE_OPTIONS: [
    { value: 'beginner' as const, label: 'Новичок' },
    { value: 'experienced' as const, label: 'Опытный' },
    { value: 'professional' as const, label: 'Профессионал' },
  ],
  // Стили карточек без стилей для вкладок (они теперь в компоненте)
  CARD_STYLES: {
    male: {
      background: 'bg-card',
      border: 'border-blue-500/30',
      header: 'bg-blue-500/5',
    },
    female: {
      background: 'bg-card',
      border: 'border-rose-500/30',
      header: 'bg-rose-500/5',
    },
  },
  EXPERIENCE_CONFIG: {
    beginner: {
      label: 'Новичок',
      icon: Award,
      className:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-300 dark:border-green-700',
    },
    experienced: {
      label: 'Опытный',
      icon: Award,
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-300 dark:border-blue-700',
    },
    professional: {
      label: 'Профессионал',
      icon: Award,
      className:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-300 dark:border-purple-700',
    },
  },
} as const;

export type GenderOption = (typeof PARTICIPANT_CONSTANTS.GENDER_OPTIONS)[number]['value'];
export type AgeOption = (typeof PARTICIPANT_CONSTANTS.AGE_OPTIONS)[number]['value'];
export type ExperienceOption = (typeof PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS)[number]['value'];
