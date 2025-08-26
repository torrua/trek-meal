// src/constants/participants.ts

import { User, Baby } from 'lucide-react';

export const PARTICIPANT_CONSTANTS = {
  GENDER_OPTIONS: [
    { value: 'male' as const, label: 'Мужской' },
    { value: 'female' as const, label: 'Женский' },
  ],
  AGE_OPTIONS: [
    { value: 'adult' as const, label: 'Взрослый', icon: User },
    { value: 'child' as const, label: 'Ребенок', icon: Baby },
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
} as const;

export type GenderOption = (typeof PARTICIPANT_CONSTANTS.GENDER_OPTIONS)[number]['value'];
export type AgeOption = (typeof PARTICIPANT_CONSTANTS.AGE_OPTIONS)[number]['value'];
