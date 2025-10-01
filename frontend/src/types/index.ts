// Shared types for Meal Calorie frontend

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  access_token: string;
}

export interface Meal {
  dish_name: string;
  servings: number;
  calories_per_serving: number;
  total_calories: number;
  source: string;
}
