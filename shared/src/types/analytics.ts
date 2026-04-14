import type { Category } from './enums';

export interface CategoryBreakdown {
  category: Category;
  plannedMinutes: number;
  completedMinutes: number;
  activities: {
    planned: number;
    completed: number;
  };
}

export interface DayCompliance {
  date: string;
  pct: number;
  passed: boolean;
}

export interface SuccessMetric {
  globalRate: number;
  daysTracked: number;
  daysPassed: number;
  last7Days: DayCompliance[];
  monthDaysPassed: number;
  monthDaysTotal: number;
}

export interface AnalyticsResponse {
  daily: CategoryBreakdown[];
  weekly: CategoryBreakdown[];
  monthly: CategoryBreakdown[];
  weeklyByDay: DayTotal[];
  monthlyByWeek: WeekTotal[];
  successMetric: SuccessMetric;
}

export interface DayTotal {
  date: string;
  dayLabel: string;
  planned: number;
  completed: number;
}

export interface WeekTotal {
  weekLabel: string;
  planned: number;
  completed: number;
}

export interface ScheduleStreak {
  streak: number;
  startDate: string | null;
}
