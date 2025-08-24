// src/types.ts

// --- Категории ---
export interface Category {
    id: number;
    name: string;
    color: string;
  }
  export type CategoryData = Omit<Category, 'id'>;
  
  // --- Участники ---
  export type Gender = 'male' | 'female';
  export type AgeGroup = 'adult' | 'child';
  
  export interface Participant {
    id: number;
    name: string;
    gender: Gender;
    age: AgeGroup;
    notes: string;
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
  
  // --- Походы ---
  export type TripDifficulty = 'easy' | 'medium' | 'hard';
  export type TripStatus = 'planning' | 'completed';
  
  export interface SelectedMealItem {
    productId: number;
    weight: number;
  }
  
  export interface SelectedMeals {
    [mealId: string]: SelectedMealItem[];
  }
  
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
    participants: number[]; // Массив ID участников
    mealsPerDay: number;
    selectedMeals: SelectedMeals;
  }
  export type TripData = Omit<Trip, 'id' | 'createdAt' | 'status' | 'selectedMeals'>;