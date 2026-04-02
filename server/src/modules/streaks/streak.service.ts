import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { streaks, dailyCompliance, habits, scheduleActivities, scheduleActivityLogs } from '../../db/schema';
import type { DailyCompliance, Streak, StreakPreview } from '@shared/types/streak';

export async function calculateDailyCompliance(
  streakId: string,
  habitId: string,
  userId: string,
  dateStr: string,
): Promise<DailyCompliance> {
  const jsDay = new Date(dateStr + 'T12:00:00').getDay();

  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
  });

  const dayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

  const logs = await db.query.scheduleActivityLogs.findMany({
    where: and(eq(scheduleActivityLogs.userId, userId), eq(scheduleActivityLogs.date, dateStr)),
  });

  const totalTasks = dayActivities.length;
  const doneSet = new Set(logs.filter((l) => l.done).map((l) => l.activityId));
  const completedTasks = dayActivities.filter((a) => doneSet.has(a.id)).length;

  if (totalTasks === 0) {
    const result: DailyCompliance = {
      id: '',
      streakId,
      habitId,
      date: dateStr,
      totalTasks: 0,
      completedTasks: 0,
      compliancePct: 0,
      passed: false,
      finalized: false,
    };
    return result;
  }

  const compliancePct = Number(((completedTasks / totalTasks) * 100).toFixed(2));
  const passed = compliancePct > 80;

  const existing = await db.query.dailyCompliance.findFirst({
    where: and(eq(dailyCompliance.streakId, streakId), eq(dailyCompliance.date, dateStr)),
  });

  if (existing) {
    const [updated] = await db
      .update(dailyCompliance)
      .set({ totalTasks, completedTasks, compliancePct: String(compliancePct), passed })
      .where(eq(dailyCompliance.id, existing.id))
      .returning();
    return { ...updated, compliancePct: Number(updated.compliancePct) };
  }

  const [row] = await db
    .insert(dailyCompliance)
    .values({
      streakId,
      habitId,
      date: dateStr,
      totalTasks,
      completedTasks,
      compliancePct: String(compliancePct),
      passed,
      finalized: false,
    })
    .returning();

  return { ...row, compliancePct: Number(row.compliancePct) };
}

export async function updateStreak(streakId: string, dateStr: string) {
  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.id, streakId),
  });
  if (!streak || streak.status !== 'active') return null;

  const habit = await db.query.habits.findFirst({
    where: eq(habits.id, streak.habitId),
  });
  if (!habit) return null;

  const compliance = await calculateDailyCompliance(
    streakId,
    streak.habitId,
    habit.userId,
    dateStr,
  );

  if (compliance.totalTasks === 0) return { streak, compliance };

  let newCompletedDays = streak.completedDays;
  let newFailedDays = streak.failedDays;
  let newCurrentDay = streak.currentDay;
  let newStatus: 'active' | 'completed' | 'failed' = streak.status;
  let newStartDate = streak.startDate;
  let archivedAt: Date | null = null;
  let newStreakId: string | null = null;

  if (compliance.passed) {
    newCompletedDays += 1;
    newCurrentDay += 1;

    if (newCurrentDay > 21) {
      newStatus = 'completed';
    }
  } else {
    newFailedDays += 1;

    if (streak.failureMode === 'reset') {
      archivedAt = new Date();
      newStatus = 'failed';

      const [newStreak] = await db
        .insert(streaks)
        .values({
          habitId: streak.habitId,
          startDate: getNextDate(dateStr),
          currentDay: 1,
          completedDays: 0,
          failedDays: 0,
          status: 'active',
          failureMode: streak.failureMode,
        })
        .returning();
      newStreakId = newStreak.id;
    } else {
      const remaining = 21 - newCurrentDay;
      const bestPossible = newCompletedDays + remaining;
      if ((bestPossible / 21) * 100 < 80) {
        newStatus = 'failed';
      }
    }
  }

  await db
    .update(streaks)
    .set({
      currentDay: newCurrentDay,
      completedDays: newCompletedDays,
      failedDays: newFailedDays,
      status: newStatus,
      startDate: newStartDate,
      archivedAt,
      updatedAt: new Date(),
    })
    .where(eq(streaks.id, streakId));

  await db
    .update(dailyCompliance)
    .set({ finalized: true })
    .where(and(eq(dailyCompliance.streakId, streakId), eq(dailyCompliance.date, dateStr)));

  const updatedStreak = { ...streak, currentDay: newCurrentDay, completedDays: newCompletedDays, failedDays: newFailedDays, status: newStatus };

  return { streak: updatedStreak, compliance, newStreakId };
}

function getNextDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function getActiveStreakForHabit(habitId: string) {
  return db.query.streaks.findFirst({
    where: and(eq(streaks.habitId, habitId), eq(streaks.status, 'active')),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });
}

export async function createStreak(habitId: string, failureMode: 'reset' | 'stall') {
  const today = new Date().toISOString().slice(0, 10);
  const [streak] = await db
    .insert(streaks)
    .values({
      habitId,
      startDate: today,
      currentDay: 1,
      completedDays: 0,
      failedDays: 0,
      status: 'active',
      failureMode,
    })
    .returning();
  return streak;
}

export async function getStreakPreview(habitId: string, userId: string): Promise<StreakPreview | null> {
  const streak = await getActiveStreakForHabit(habitId);
  if (!streak) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayCompliance = await calculateDailyCompliance(streak.id, habitId, userId, today);

  return {
    currentDay: streak.currentDay,
    completedDays: streak.completedDays,
    failedDays: streak.failedDays,
    status: streak.status as StreakPreview['status'],
    todayCompliance,
  };
}

export async function getComplianceHistory(streakId: string) {
  return db.query.dailyCompliance.findMany({
    where: and(eq(dailyCompliance.streakId, streakId), eq(dailyCompliance.finalized, true)),
    orderBy: (c, { asc }) => [asc(c.date)],
  });
}

export async function runMidnightCron() {
  const today = new Date().toISOString().slice(0, 10);

  const activeStreaks = await db.query.streaks.findMany({
    where: eq(streaks.status, 'active'),
  });

  console.log(`[Cron] Processing ${activeStreaks.length} active streaks for ${today}`);

  for (const streak of activeStreaks) {
    try {
      await updateStreak(streak.id, today);
    } catch (err) {
      console.error(`[Cron] Error processing streak ${streak.id}:`, err);
    }
  }

  console.log(`[Cron] Completed processing for ${today}`);
}
