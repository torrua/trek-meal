// src/constants/trips.ts

import { List, CheckCircle, Clock, Gauge } from 'lucide-react';
import type { TripDifficulty, TripStatus } from '../types';

export const TRIP_STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы', icon: List },
  { value: 'planning', label: 'Планируются', icon: Clock },
  { value: 'completed', label: 'Завершенные', icon: CheckCircle },
];

export const TRIP_DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Любая сложность', icon: Gauge },
  { value: 'easy', label: 'Легкие', icon: Gauge },
  { value: 'medium', label: 'Средние', icon: Gauge },
  { value: 'hard', label: 'Сложные', icon: Gauge },
];

export const DIFFICULTY_CONFIG: Record<
  TripDifficulty,
  { label: string; icon: React.ElementType; colorClassName: string }
> = {
  easy: {
    label: 'Легкий',
    icon: Gauge,
    colorClassName: 'text-green-600 dark:text-green-400',
  },
  medium: {
    label: 'Средний',
    icon: Gauge,
    colorClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  hard: {
    label: 'Сложный',
    icon: Gauge,
    colorClassName: 'text-red-600 dark:text-red-400',
  },
};

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
