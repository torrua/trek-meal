// src/types.ts

// --- Категории ---
export interface Category {
  id: number;
  name: string;
  color: string;
  emoji?: string;
}
export type CategoryData = Omit<Category, 'id'>;

// --- Участники ---
export type Gender = 'male' | 'female';
export type AgeGroup = 'adult' | 'child';
export type ExperienceLevel = 'beginner' | 'experienced' | 'professional';

export interface Participant {
  id: number;
  name: string;
  gender: Gender;
  age: AgeGroup;
  notes: string;
  // Новые поля
  experienceLevel: ExperienceLevel;
  phone?: string;
  email?: string;
  birthDate?: string; // ISO date string
}
export type ParticipantData = Omit<Participant, 'id'>;

// --- Продукты ---
export interface ProductPortion {
  name: string;
  weight: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  isPerishable: boolean;
  packaging: string;
  categoryId: number | null;
  portions: ProductPortion[];
}
export type ProductData = Omit<Product, 'id'>;

// --- Блюда (Шаблоны) ---
export interface DishProduct {
  productId: number;
  weight: number;
}

export interface Dish {
  id: number;
  name: string;
  products: DishProduct[];
}
export type DishData = Omit<Dish, 'id'>;

export type MealPlanItem =
  | {
      instanceId: string; // Уникальный ID для КАЖДОЙ строки в раскладке
      type: 'dish';
      itemId: number; // Тут будет dishId
    }
  | {
      instanceId: string;
      type: 'product';
      itemId: number; // Тут будет productId
      weight: number;
    };

export interface SelectedMeals {
  [mealId: string]: MealPlanItem[];
}
// ------------------------------------------

// --- Походы ---
export type TripDifficulty = 'easy' | 'medium' | 'hard';
export type TripStatus = 'planning' | 'completed' | 'active';

export interface Trip {
  id: number;
  createdAt: string;
  status: TripStatus;
  name: string;
  description: string;
  destination: string;
  difficulty: TripDifficulty;
  days: number;
  startDate: string;
  endDate: string;
  participants: number[];
  mealsPerDay: number;
  selectedMeals: SelectedMeals; // <-- Теперь использует новую структуру
}
export type TripData = Omit<Trip, 'id' | 'createdAt' | 'status' | 'selectedMeals'>;

export type SubmitDishAction = 'add_as_new' | 'replace' | 'create_or_update';
