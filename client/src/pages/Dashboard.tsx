import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { es } from '@/i18n/es';
import { WeekGrid } from '@/components/dashboard/WeekGrid';
import { DayDetail } from '@/components/dashboard/DayDetail';
import { CategoryProgressBars, CategoryBarCard } from '@/components/dashboard/CategoryProgressBars';
import { MonthlyDotGrid } from '@/components/dashboard/MonthlyDotGrid';
import { WeekComparison } from '@/components/dashboard/WeekComparison';
import { CategoryBalanceInsight } from '@/components/dashboard/CategoryBalanceInsight';
import { useAuth } from '@/hooks/useAuth';
import { useToday } from '@/hooks/useToday';
import type { AnalyticsResponse, DayCompliance, DayActivityDetail, WeekComparison as WeekComparisonType, MonthlyDotsResponse } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [monthlyDots, setMonthlyDots] = useState<DayCompliance[]>([]);
  const [firstLogDate, setFirstLogDate] = useState<string | null>(null);
  const [dayActivities, setDayActivities] = useState<DayActivityDetail[]>([]);
  const [weekComp, setWeekComp] = useState<WeekComparisonType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayLoading, setDayLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const today = useToday(user?.timezone);
  const [currentMonth, setCurrentMonth] = useState(() => today.slice(0, 7));

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

  const dailyPlanned = useMemo<Record<Category, number>>(() => {
    const r: Record<Category, number> = { academic: 0, vital: 0, personal: 0, escape: 0 };
    for (const a of dayActivities) {
      if (!a.time || !a.endTime) continue;
      const [sh, sm] = a.time.split(':').map(Number);
      const [eh, em] = a.endTime.split(':').map(Number);
      const dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur > 0) r[a.category] += dur;
    }
    return r;
  }, [dayActivities]);

  const weeklyPlanned = useMemo<Record<Category, number>>(() => {
    const r: Record<Category, number> = { academic: 0, vital: 0, personal: 0, escape: 0 };
    for (const d of (analytics?.weekly ?? [])) {
      r[d.category] = d.plannedMinutes;
    }
    return r;
  }, [analytics]);

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
    ? weekAvg >= 80 ? 'bg-success-light text-success-dark' : weekAvg >= 50 ? 'bg-warning-light text-warning-dark' : 'bg-danger-light text-danger-dark'
    : '';

  return (
    <div className="flex min-h-0 flex-col gap-3 page-fade-in md:h-[calc(100vh-8rem)]">
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

      <div className="dashboard-grid grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-3 md:gap-3 md:grid-rows-[auto_1fr_1fr_1fr_1fr]">
        <div className="md:row-start-1 md:row-span-3 min-h-0">
          <DayDetail
            activities={dayActivities}
            loading={dayLoading}
            date={selectedDate ?? today}
          />
        </div>
        {!dayLoading && dayActivities.length > 0 && (
          <div className="md:row-start-4 md:row-span-2">
            <CategoryBalanceInsight
              plannedMinutes={dailyPlanned}
              title={es.dashboard.balanceDaily}
            />
          </div>
        )}

        {weekComp && (weekComp.thisWeek.daysTotal > 0 || weekComp.lastWeek.daysTotal > 0) && (
          <div className="md:col-start-2 md:row-start-1">
            <WeekComparison data={weekComp} />
          </div>
        )}
        {hasWeeklyData && weekly.filter((d) => d.plannedMinutes > 0).map((d, i) => {
          const rowStart = i + 2;
          return (
            <div
              key={d.category}
              className="md:col-start-2 min-h-0"
              style={{ gridRowStart: rowStart, gridRowEnd: rowStart + 1 }}
            >
              <CategoryBarCard data={d} />
            </div>
          );
        })}

        {hasWeeklyData && (
          <div className="md:col-start-3 md:row-start-1 md:row-span-2">
            <CategoryBalanceInsight
              plannedMinutes={weeklyPlanned}
              title={es.dashboard.balanceWeekly}
            />
          </div>
        )}
        {monthlyDots.length > 0 && (
          <div className="md:col-start-3 md:row-start-3 md:row-span-3 min-h-0">
            <MonthlyDotGrid
              data={monthlyDots}
              today={today}
              currentMonth={currentMonth}
              firstLogDate={firstLogDate}
              onMonthChange={handleMonthChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
