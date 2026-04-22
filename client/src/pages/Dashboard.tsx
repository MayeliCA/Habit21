import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { WeekGrid } from '@/components/dashboard/WeekGrid';
import { DayDetail } from '@/components/dashboard/DayDetail';
import { CategoryProgressBars } from '@/components/dashboard/CategoryProgressBars';
import { MonthlyDotGrid } from '@/components/dashboard/MonthlyDotGrid';
import { WeekComparison } from '@/components/dashboard/WeekComparison';
import type { AnalyticsResponse, DayCompliance, DayActivityDetail, WeekComparison as WeekComparisonType, MonthlyDotsResponse } from '@shared/types/analytics';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [monthlyDots, setMonthlyDots] = useState<DayCompliance[]>([]);
  const [firstLogDate, setFirstLogDate] = useState<string | null>(null);
  const [dayActivities, setDayActivities] = useState<DayActivityDetail[]>([]);
  const [weekComp, setWeekComp] = useState<WeekComparisonType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const today = new Date().toISOString().slice(0, 10);

  const fetchMonthDots = useCallback((month: string) => {
    api.get<MonthlyDotsResponse>('/analytics/monthly-dots', { params: { month } })
      .then((res) => {
        setMonthlyDots(res.data.days);
        setFirstLogDate(res.data.firstLogDate);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      api.get<AnalyticsResponse>('/analytics', { params: { date: today } }),
      api.get<MonthlyDotsResponse>('/analytics/monthly-dots'),
      api.get<WeekComparisonType>('/analytics/week-comparison'),
    ])
      .then(([analyticsRes, dotsRes, compRes]) => {
        setAnalytics(analyticsRes.data);
        setMonthlyDots(dotsRes.data.days);
        setFirstLogDate(dotsRes.data.firstLogDate);
        setWeekComp(compRes.data);
        setSelectedDate(today);
      })
      .finally(() => setLoading(false));
  }, [today]);

  useEffect(() => {
    if (!selectedDate) return;
    setDayLoading(true);
    api
      .get<DayActivityDetail[]>('/analytics/day-detail', { params: { date: selectedDate } })
      .then((res) => setDayActivities(res.data))
      .finally(() => setDayLoading(false));
  }, [selectedDate]);

  const handleMonthChange = useCallback((month: string) => {
    setCurrentMonth(month);
    fetchMonthDots(month);
  }, [fetchMonthDots]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-sm text-muted-foreground">{es.common.loading}</p>
      </div>
    );
  }

  const weeklyByDay = analytics?.weeklyByDay ?? [];
  const weekly = analytics?.weekly ?? [];
  const hasWeeklyData = weekly.some((d) => d.plannedMinutes > 0);

  const weekAvg = (() => {
    const withData = weeklyByDay.filter((d) => d.planned > 0 && d.date <= today);
    if (withData.length === 0) return null;
    const totalPct = withData.reduce((s, d) => s + (d.completed / d.planned) * 100, 0);
    return Math.round(totalPct / withData.length);
  })();

  const weekAvgColor = weekAvg !== null
    ? weekAvg >= 80 ? 'bg-green-100 text-green-700' : weekAvg >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
    : '';

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-3 page-fade-in">
      <section>
        <div className="mb-2 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {es.dashboard.weekTitle}
          </h2>
          {weekAvg !== null && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${weekAvgColor}`}>
              {es.dashboard.weekSummary.replace('{pct}', String(weekAvg))}
            </span>
          )}
        </div>
        <WeekGrid
          data={weeklyByDay}
          today={today}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </section>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        <section className="min-h-0">
          <DayDetail
            activities={dayActivities}
            loading={dayLoading}
            date={selectedDate ?? today}
          />
        </section>

        {hasWeeklyData && (
          <section className="flex min-h-0 flex-col">
            <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
              {es.dashboard.weekBalance}
            </h2>
            <CategoryProgressBars data={weekly} compact />
          </section>
        )}

        <div className="flex min-h-0 flex-col gap-3">
          {weekComp && (weekComp.thisWeek.daysTotal > 0 || weekComp.lastWeek.daysTotal > 0) && (
            <section>
              <WeekComparison data={weekComp} />
            </section>
          )}

          {monthlyDots.length > 0 && (
            <section className="min-h-0 flex-1">
              <MonthlyDotGrid
                data={monthlyDots}
                today={today}
                currentMonth={currentMonth}
                firstLogDate={firstLogDate}
                onMonthChange={handleMonthChange}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
