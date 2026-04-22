import type { StreakStatus } from './enums';

export interface Streak {
  id: string;
  habitId: string;
  startDate: string;
  currentDay: number;
  status: StreakStatus;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  streakId: string;
  habitId: string;
  userId: string;
  date: string;
  done: boolean;
  createdAt: string;
}

export interface StreakPreview {
  streak: Streak;
  todayLog: HabitLog | null;
  logHistory: HabitLog[];
}

export interface StreakAttempt {
  attemptNumber: number;
  startDate: string;
  currentDay: number;
  status: StreakStatus;
  archivedAt: string | null;
  createdAt: string;
}

export interface StreakHistory {
  habitId: string;
  habitTitle: string;
  totalAttempts: number;
  bestStreak: number;
  completedCount: number;
  recoveryRate: number;
  avgDaysBeforeFail: number;
  typicalFailDay: number;
  attempts: StreakAttempt[];
}
