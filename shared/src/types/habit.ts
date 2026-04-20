import type { Category } from './enums';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  category: Category;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHabitInput {
  title: string;
  category?: Category;
  description?: string;
}

export interface UpdateHabitInput {
  title?: string;
  category?: Category;
  description?: string;
  isActive?: boolean;
}
