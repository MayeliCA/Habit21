import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../../db';
import { scheduleActivities, scheduleActivityLogs } from '../../db/schema';
import type { CategoryBreakdown, AnalyticsResponse, SuccessMetric, DayCompliance, DayTotal, WeekTotal, ScheduleStreak } from '@shared/types/analytics';
import type { Category } from '@shared/types/enums';

const ALL_CATEGORIES: Category[] = ['academic', 'vital', 'personal', 'escape'];

function parseDurationMinutes(time: string, endTime: string): number {
  const [h1, m1] = time.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

function getJsDay(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

interface ActivityWithCategory {
  id: string;
  category: Category;
  time: string;
  endTime: string;
  daysOfWeek: number[];
}

interface LogEntry {
  activityId: string;
  date: string;
  done: boolean;
}

function computeBreakdown(
  activities: ActivityWithCategory[],
  logs: LogEntry[],
  dateStr: string,
): CategoryBreakdown[] {
  const jsDay = getJsDay(dateStr);

  const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));
  const dayLogMap = new Map(logs.filter((l) => l.date === dateStr).map((l) => [l.activityId, l]));

  const acc: Record<string, { plannedMin: number; completedMin: number; plannedCount: number; completedCount: number }> = {};
  for (const c of ALL_CATEGORIES) {
    acc[c] = { plannedMin: 0, completedMin: 0, plannedCount: 0, completedCount: 0 };
  }

  for (const a of dayActivities) {
    const dur = parseDurationMinutes(a.time, a.endTime);
    const log = dayLogMap.get(a.id);
    acc[a.category].plannedMin += dur;
    acc[a.category].plannedCount += 1;
    if (log?.done) {
      acc[a.category].completedMin += dur;
      acc[a.category].completedCount += 1;
    }
  }

  return ALL_CATEGORIES.map((category) => ({
    category,
    plannedMinutes: acc[category].plannedMin,
    completedMinutes: acc[category].completedMin,
    activities: {
      planned: acc[category].plannedCount,
      completed: acc[category].completedCount,
    },
  }));
}

function computeRangeBreakdown(
  activities: ActivityWithCategory[],
  logs: LogEntry[],
  startDate: string,
  endDate: string,
): CategoryBreakdown[] {
  const start = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');

  const daysInRange: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    daysInRange.push(d.toISOString().slice(0, 10));
  }

  const daySet = new Set(daysInRange);
  const rangeLogs = logs.filter((l) => daySet.has(l.date));

  const logByDateAndActivity = new Map<string, LogEntry>();
  for (const l of rangeLogs) {
    logByDateAndActivity.set(`${l.date}:${l.activityId}`, l);
  }

  const acc: Record<string, { plannedMin: number; completedMin: number; plannedCount: number; completedCount: number }> = {};
  for (const c of ALL_CATEGORIES) {
    acc[c] = { plannedMin: 0, completedMin: 0, plannedCount: 0, completedCount: 0 };
  }

  for (const dateStr of daysInRange) {
    const jsDay = getJsDay(dateStr);
    const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

    for (const a of dayActivities) {
      const dur = parseDurationMinutes(a.time, a.endTime);
      const log = logByDateAndActivity.get(`${dateStr}:${a.id}`);
      acc[a.category].plannedMin += dur;
      acc[a.category].plannedCount += 1;
      if (log?.done) {
        acc[a.category].completedMin += dur;
        acc[a.category].completedCount += 1;
      }
    }
  }

  return ALL_CATEGORIES.map((category) => ({
    category,
    plannedMinutes: acc[category].plannedMin,
    completedMinutes: acc[category].completedMin,
    activities: {
      planned: acc[category].plannedCount,
      completed: acc[category].completedCount,
    },
  }));
}

function computeSuccessMetric(
  activities: ActivityWithCategory[],
  allLogs: LogEntry[],
  today: string,
): SuccessMetric {
  if (activities.length === 0) {
    const d = new Date(today + 'T12:00:00');
    const monthDaysTotal = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return { globalRate: 0, daysTracked: 0, daysPassed: 0, last7Days: [], monthDaysPassed: 0, monthDaysTotal };
  }

  const logByDateAndActivity = new Map<string, LogEntry>();
  for (const l of allLogs) {
    logByDateAndActivity.set(`${l.date}:${l.activityId}`, l);
  }

  const earliest = activities.reduce((min, a) => {
    for (const d of a.daysOfWeek) {
      // no-op, just need earliest possible date
    }
    return min;
  }, today);

  const firstLogDate = allLogs.length > 0
    ? allLogs.reduce((min, l) => (l.date < min ? l.date : min), allLogs[0].date)
    : today;

  const startDate = firstLogDate < earliest ? firstLogDate : earliest;

  const dayCompliances: DayCompliance[] = [];
  let current = startDate;
  while (current <= today) {
    const jsDay = getJsDay(current);
    const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

    if (dayActivities.length > 0) {
      const doneCount = dayActivities.filter((a) => {
        const log = logByDateAndActivity.get(`${current}:${a.id}`);
        return log?.done === true;
      }).length;

      const pct = (doneCount / dayActivities.length) * 100;
      dayCompliances.push({ date: current, pct: Number(pct.toFixed(2)), passed: pct >= 80 });
    }

    current = addDays(current, 1);
  }

  const daysTracked = dayCompliances.length;
  const daysPassed = dayCompliances.filter((d) => d.passed).length;
  const globalRate = daysTracked > 0
    ? Number((dayCompliances.reduce((sum, d) => sum + d.pct, 0) / daysTracked).toFixed(2))
    : 0;

  const last7Start = subtractDays(today, 6);
  const last7Days: DayCompliance[] = [];
  for (let d = last7Start; ; d = addDays(d, 1)) {
    const found = dayCompliances.find((dc) => dc.date === d);
    if (found) {
      last7Days.push(found);
    } else {
      const jsDay = getJsDay(d);
      const dayActs = activities.filter((a) => a.daysOfWeek.includes(jsDay));
      if (dayActs.length > 0) {
        last7Days.push({ date: d, pct: 0, passed: false });
      }
    }
    if (d === today) break;
  }

  const todayDate = new Date(today + 'T12:00:00');
  const monthPrefix = today.slice(0, 7);
  const monthDaysTotal = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
  const monthDaysPassed = dayCompliances.filter((d) => d.date.startsWith(monthPrefix) && d.passed).length;

  return { globalRate, daysTracked, daysPassed, last7Days, monthDaysPassed, monthDaysTotal };
}

const DAY_LABELS: Record<number, string> = {
  0: 'D',
  1: 'L',
  2: 'M',
  3: 'M',
  4: 'J',
  5: 'V',
  6: 'S',
};

function computeWeeklyByDay(
  activities: ActivityWithCategory[],
  logs: LogEntry[],
  today: string,
): DayTotal[] {
  const todayJsDay = getJsDay(today);
  const mondayOffset = todayJsDay === 0 ? -6 : 1 - todayJsDay;
  const monday = addDays(today, mondayOffset);

  const logByDateAndActivity = new Map<string, LogEntry>();
  for (const l of logs) {
    logByDateAndActivity.set(`${l.date}:${l.activityId}`, l);
  }

  const result: DayTotal[] = [];
  const jsDayOrder = [1, 2, 3, 4, 5, 6, 0];

  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(monday, i);
    const jsDay = jsDayOrder[i];
    const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

    let planned = 0;
    let completed = 0;
    for (const a of dayActivities) {
      planned += parseDurationMinutes(a.time, a.endTime);
      const log = logByDateAndActivity.get(`${dateStr}:${a.id}`);
      if (log?.done) {
        completed += parseDurationMinutes(a.time, a.endTime);
      }
    }
    result.push({ date: dateStr, dayLabel: DAY_LABELS[jsDay], planned, completed });
  }

  return result;
}

function computeMonthlyByWeek(
  activities: ActivityWithCategory[],
  logs: LogEntry[],
  today: string,
): WeekTotal[] {
  const todayDate = new Date(today + 'T12:00:00');
  const year = todayDate.getFullYear();
  const month = todayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const logByDateAndActivity = new Map<string, LogEntry>();
  for (const l of logs) {
    logByDateAndActivity.set(`${l.date}:${l.activityId}`, l);
  }

  const weeks: WeekTotal[] = [];
  let weekStart = 1;
  let weekNum = 1;

  while (weekStart <= daysInMonth) {
    const weekEnd = Math.min(weekStart + 6, daysInMonth);

    let planned = 0;
    let completed = 0;

    for (let day = weekStart; day <= weekEnd; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const jsDay = getJsDay(dateStr);
      const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

      for (const a of dayActivities) {
        planned += parseDurationMinutes(a.time, a.endTime);
        const log = logByDateAndActivity.get(`${dateStr}:${a.id}`);
        if (log?.done) {
          completed += parseDurationMinutes(a.time, a.endTime);
        }
      }
    }

    weeks.push({ weekLabel: `Semana ${weekNum}`, planned, completed });
    weekStart = weekEnd + 1;
    weekNum++;
  }

  return weeks;
}

export async function getScheduleStreak(userId: string, today: string): Promise<ScheduleStreak> {
  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
    columns: { id: true, category: true, time: true, endTime: true, daysOfWeek: true },
  }) as ActivityWithCategory[];

  if (activities.length === 0) {
    return { streak: 0, pendingStreak: 0, startDate: null };
  }

  const allLogs = await db.query.scheduleActivityLogs.findMany({
    where: eq(scheduleActivityLogs.userId, userId),
    columns: { activityId: true, date: true, done: true },
  }) as LogEntry[];

  const logByDateAndActivity = new Map<string, LogEntry>();
  for (const l of allLogs) {
    logByDateAndActivity.set(`${l.date}:${l.activityId}`, l);
  }

  const firstLogDate = allLogs.length > 0
    ? allLogs.reduce((min, l) => (l.date < min ? l.date : min), allLogs[0].date)
    : today;

  const dayCompliances: Map<string, { pct: number; passed: boolean }> = new Map();
  let current = firstLogDate;
  while (current <= today) {
    const jsDay = getJsDay(current);
    const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

    if (dayActivities.length > 0) {
      const doneCount = dayActivities.filter((a) => {
        const log = logByDateAndActivity.get(`${current}:${a.id}`);
        return log?.done === true;
      }).length;
      const pct = (doneCount / dayActivities.length) * 100;
      dayCompliances.set(current, { pct: Number(pct.toFixed(2)), passed: pct >= 80 });
    }

    current = addDays(current, 1);
  }

  let streak = 0;
  let startDate: string | null = null;
  let d = today;

  while (true) {
    const info = dayCompliances.get(d);
    const jsDay = getJsDay(d);
    const hasActivities = activities.some((a) => a.daysOfWeek.includes(jsDay));

    if (hasActivities) {
      if (info && info.passed) {
        startDate = d;
        streak++;
        d = subtractDays(d, 1);
      } else {
        break;
      }
    } else {
      if (d <= firstLogDate) break;
      d = subtractDays(d, 1);
    }
  }

  let pendingStreak = 0;
  if (streak === 0) {
    const yesterday = subtractDays(today, 1);
    let pd = yesterday;
    while (true) {
      const info = dayCompliances.get(pd);
      const jsDay = getJsDay(pd);
      const hasActivities = activities.some((a) => a.daysOfWeek.includes(jsDay));

      if (hasActivities) {
        if (info && info.passed) {
          pendingStreak++;
          pd = subtractDays(pd, 1);
        } else {
          break;
        }
      } else {
        if (pd <= firstLogDate) break;
        pd = subtractDays(pd, 1);
      }
    }
  }

  return { streak, pendingStreak, startDate };
}

export async function getAnalytics(userId: string, dateStr: string): Promise<AnalyticsResponse> {
  const weekStart = subtractDays(dateStr, 6);
  const monthStart = subtractDays(dateStr, 29);

  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
    columns: { id: true, category: true, time: true, endTime: true, daysOfWeek: true },
  }) as ActivityWithCategory[];

  const monthLogs = await db.query.scheduleActivityLogs.findMany({
    where: and(
      eq(scheduleActivityLogs.userId, userId),
      gte(scheduleActivityLogs.date, monthStart),
      lte(scheduleActivityLogs.date, dateStr),
    ),
    columns: { activityId: true, date: true, done: true },
  }) as LogEntry[];

  const allLogs = await db.query.scheduleActivityLogs.findMany({
    where: eq(scheduleActivityLogs.userId, userId),
    columns: { activityId: true, date: true, done: true },
  }) as LogEntry[];

  const daily = computeBreakdown(activities, monthLogs, dateStr);
  const weekly = computeRangeBreakdown(activities, monthLogs, weekStart, dateStr);
  const monthly = computeRangeBreakdown(activities, monthLogs, monthStart, dateStr);
  const weeklyByDay = computeWeeklyByDay(activities, allLogs, dateStr);
  const monthlyByWeek = computeMonthlyByWeek(activities, allLogs, dateStr);
  const successMetric = computeSuccessMetric(activities, allLogs, dateStr);

  return { daily, weekly, monthly, weeklyByDay, monthlyByWeek, successMetric };
}
