import type { StreakStatus, FailureMode } from './enums';

export interface Streak {
  id: string;
  habitId: string;
  startDate: string;
  currentDay: number;
  completedDays: number;
  failedDays: number;
  status: StreakStatus;
  failureMode: FailureMode;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCompliance {
  id: string;
  streakId: string;
  habitId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  compliancePct: number;
  passed: boolean;
  finalized: boolean;
}

export interface StreakPreview {
  currentDay: number;
  completedDays: number;
  failedDays: number;
  status: StreakStatus;
  todayCompliance: DailyCompliance | null;
}
