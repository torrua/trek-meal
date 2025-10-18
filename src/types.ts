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
  experienceLevel: ExperienceLevel;
  phone?: string;
  email?: string;
  birthDate?: string; // ISO date string
  equipmentIds: number[]; // Equipment owned by participant
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
  description: string;
  products: DishProduct[];
}
export type DishData = Omit<Dish, 'id'>;

export type MealPlanItem =
  | {
      instanceId: string;
      type: 'dish';
      itemId: number;
    }
  | {
      instanceId: string;
      type: 'product';
      itemId: number;
      weight: number;
    };

export interface SelectedMeals {
  [mealId: string]: MealPlanItem[];
}

// --- Походы ---
export type TripDifficulty = 'easy' | 'medium' | 'hard';
export type TripStatus = 'planning' | 'completed' | 'active';

export interface Trip {
  id: number;
  createdAt: string;
  status: 'planning' | 'completed'; // Note: status is for persistence, effectiveStatus is calculated
  name: string;
  description: string;
  destination: string;
  difficulty: TripDifficulty;
  days: number;
  startDate: string;
  endDate: string;
  participants: number[];
  // Flexible meal structure: each day can have different meals
  dayMeals: { [dayNumber: string]: MealInstance[] }; // Array of meal instances for each day
  selectedMeals: SelectedMeals;
  requiredEquipmentIds: number[]; // Equipment required for this trip
  assignedEquipment: { [participantId: number]: number[] }; // Equipment assignments per participant
}
export type TripData = Omit<Trip, 'id' | 'createdAt' | 'status' | 'selectedMeals' | 'dayMeals'>;

export type SubmitDishAction = 'add_as_new' | 'replace' | 'create_or_update';

// --- НОВЫЙ ТИП: Экземпляр приема пищи ---
export interface MealInstance {
  instanceId: string;
  title: string;
  description?: string;
}

export interface Meal {
  id: number;
  name: string;
  description?: string;
  items: MealPlanItem[];
}

export type MealData = Omit<Meal, 'id'>;

export interface MealType {
  id: number;
  name: string;
  description?: string;
  defaultValues: MealData;
  repeatable?: boolean;
}

// --- НОВЫЙ ТИП: Для импортируемых файлов ---
export interface ImportedJsonData {
  products: ProductData[];
  // Можно будет расширять другими ключами в будущем
}

// --- Снаряжение ---
export type EquipmentType = 'personal' | 'common';

export interface EquipmentCategory {
  id: number;
  name: string;
  color: string;
}
export type EquipmentCategoryData = Omit<EquipmentCategory, 'id'>;

export interface Equipment {
  id: number;
  name: string;
  description: string;
  weight: number; // weight in grams
  type: EquipmentType;
  categoryId: number | null;
  ownerId: number | null; // Participant who owns this equipment
  link?: string; // Optional link to product page, manual, etc.
}
export type EquipmentData = Omit<Equipment, 'id'>;

// --- Снаряжение участников ---
export interface ParticipantEquipment {
  participantId: number;
  equipmentId: number;
  quantity: number;
}

// --- Снаряжение в походах ---
export interface TripEquipmentRequirement {
  equipmentId: number;
  quantity: number;
  isRequired: boolean;
}

export interface TripEquipmentAssignment {
  participantId: number;
  equipmentId: number;
  quantity: number;
}
