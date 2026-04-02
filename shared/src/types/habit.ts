import type { FailureMode } from './enums';

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  failureMode: FailureMode;
  isActive: boolean;
  createdAt: string;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  failureMode?: FailureMode;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  failureMode?: FailureMode;
  isActive?: boolean;
}
