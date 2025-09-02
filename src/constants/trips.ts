// src/constants/trips.ts

import { List, CheckCircle, Clock, Gauge, Flame } from 'lucide-react';
import type { TripDifficulty, TripStatus } from '../types';

export const TRIP_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы', icon: List },
  { value: 'planning', label: 'Планируются', icon: Clock },
  { value: 'completed', label: 'Завершенные', icon: CheckCircle },
];

export const TRIP_DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Любая сложность', icon: Gauge },
  // --- ИЗМЕНЕНИЕ: Исправлена иконка ---
  { value: 'easy', label: 'Легкие', icon: Flame },
  { value: 'medium', label: 'Средние', icon: Flame },
  { value: 'hard', label: 'Сложные', icon: Flame },
];

export const DIFFICULTY_CONFIG: Record<
  TripDifficulty,
  { label: string; icon: React.ElementType; colorClassName: string }
> = {
  easy: {
    label: 'Легкий',
    icon: Flame,
    colorClassName: 'text-green-600 dark:text-green-400',
  },
  medium: {
    label: 'Средний',
    icon: Flame,
    colorClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  hard: {
    label: 'Сложный',
    icon: Flame,
    colorClassName: 'text-red-600 dark:text-red-400',
  },
};

// --- НОВЫЙ КОНФИГ ДЛЯ СТАТУСОВ ---
export const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; icon: React.ElementType; borderClassName: string }
> = {
  planning: {
    label: 'Планируется',
    icon: Clock,
    borderClassName: 'border-l-yellow-500',
  },
  completed: {
    label: 'Завершен',
    icon: CheckCircle,
    borderClassName: 'border-l-green-500',
  },
};
