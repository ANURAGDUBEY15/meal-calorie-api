import { create } from 'zustand';
import { Meal } from '../types';

interface MealState {
  history: Meal[];
  addMeal: (meal: Meal) => void;
  clearHistory: () => void;
}

export const useMealStore = create<MealState>((set) => ({
  history: [],
  addMeal: (meal) => set((state) => ({ history: [meal, ...state.history] })),
  clearHistory: () => set({ history: [] }),
}));
