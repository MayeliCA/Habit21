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
}

export interface AnalyticsResponse {
  daily: CategoryBreakdown[];
  weekly: CategoryBreakdown[];
  monthly: CategoryBreakdown[];
  successMetric: SuccessMetric;
}
