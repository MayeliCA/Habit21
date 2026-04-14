export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  isActive?: boolean;
}
