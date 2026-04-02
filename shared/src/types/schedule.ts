import type { Category } from './enums';

export interface ScheduleActivity {
  id: string;
  userId: string;
  daysOfWeek: number[];
  time: string;
  endTime: string;
  category: Category;
  activity: string;
  sortOrder: number;
  createdAt: string;
}

export interface ScheduleActivityLog {
  id: string;
  activityId: string;
  userId: string;
  date: string;
  done: boolean;
  doneAt: string | null;
}

export interface ActivityWithLog extends ScheduleActivity {
  log?: ScheduleActivityLog | null;
}

export interface CreateActivityInput {
  daysOfWeek: number[];
  time: string;
  endTime: string;
  category: Category;
  activity: string;
}

export interface UpdateActivityInput {
  daysOfWeek?: number[];
  time?: string;
  endTime?: string;
  category?: Category;
  activity?: string;
}

export interface ReorderInput {
  id: string;
  sortOrder: number;
}

export interface TodayStatus {
  total: number;
  completed: number;
  compliancePct: number;
  passed: boolean;
}
