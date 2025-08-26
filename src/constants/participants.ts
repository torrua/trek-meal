// src/constants/participants.ts

import { User, Baby } from 'lucide-react';

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
  // Цветовые схемы для карточек (только пол)
  CARD_STYLES: {
    male: {
      background: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      header: 'bg-blue-100 dark:bg-blue-900/50',
      footer: 'bg-blue-200/50 dark:bg-blue-900/30',
    },
    female: {
      background: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200 dark:border-rose-800',
      header: 'bg-rose-100 dark:bg-rose-900/50',
      footer: 'bg-rose-200/50 dark:bg-rose-900/30',
    },
  } as const,
  // Стили для уровней опыта
  EXPERIENCE_STYLES: {
    beginner: {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
    },
    experienced: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    professional: {
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-800',
    },
  } as const,
} as const;

export type GenderOption = (typeof PARTICIPANT_CONSTANTS.GENDER_OPTIONS)[number]['value'];
export type AgeOption = (typeof PARTICIPANT_CONSTANTS.AGE_OPTIONS)[number]['value'];
export type ExperienceOption = (typeof PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS)[number]['value'];
