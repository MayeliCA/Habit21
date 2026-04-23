import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../db';
import { streaks, habitLogs, habits, users } from '../../db/schema';
import { todayForTimezone, getHourInTimezone } from '../../utils/date';
import type { Streak, HabitLog, StreakPreview, StreakAttempt, StreakHistory } from '@shared/types/streak';

function serializeStreak(s: any): Streak {
  return {
    ...s,
    archivedAt: s.archivedAt ? new Date(s.archivedAt).toISOString() : null,
    createdAt: new Date(s.createdAt).toISOString(),
    updatedAt: new Date(s.updatedAt).toISOString(),
  };
}

function serializeHabitLog(l: any): HabitLog {
  return {
    ...l,
    createdAt: new Date(l.createdAt).toISOString(),
  };
}

export async function getActiveStreakForHabit(habitId: string) {
  return db.query.streaks.findFirst({
    where: and(eq(streaks.habitId, habitId), eq(streaks.status, 'active')),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });
}

export async function createStreak(habitId: string, userId: string, timezone: string) {
  const today = todayForTimezone(timezone);
  const [streak] = await db
    .insert(streaks)
    .values({
      habitId,
      startDate: today,
      currentDay: 1,
      status: 'active',
    })
    .returning();

  await db
    .insert(habitLogs)
    .values({
      streakId: streak.id,
      habitId,
      userId,
      date: today,
      done: true,
    });

  return streak;
}

export async function logHabitDay(streakId: string, userId: string, dateStr: string) {
  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.id, streakId),
  });
  if (!streak || streak.status !== 'active') return null;

  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, streak.habitId), eq(habits.userId, userId)),
  });
  if (!habit) return null;

  const existing = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.streakId, streakId), eq(habitLogs.date, dateStr)),
  });
  if (existing) return { streak, log: existing, alreadyLogged: true };

  const [log] = await db
    .insert(habitLogs)
    .values({
      streakId,
      habitId: streak.habitId,
      userId,
      date: dateStr,
      done: true,
    })
    .returning();

  const newCurrentDay = streak.currentDay + 1;
  const newStatus = newCurrentDay >= 21 ? 'completed' : 'active';

  await db
    .update(streaks)
    .set({
      currentDay: newCurrentDay,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(streaks.id, streakId));

  return {
    streak: { ...streak, currentDay: newCurrentDay, status: newStatus },
    log,
    alreadyLogged: false,
  };
}

export async function getStreakPreview(habitId: string, timezone: string): Promise<StreakPreview | null> {
  const streak = await getActiveStreakForHabit(habitId);
  if (!streak) return null;

  const today = todayForTimezone(timezone);

  const todayLog = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.streakId, streak.id), eq(habitLogs.date, today)),
  });

  const logHistory = await db.query.habitLogs.findMany({
    where: eq(habitLogs.streakId, streak.id),
    orderBy: (l, { asc }) => [asc(l.date)],
  });

  return {
    streak: serializeStreak(streak),
    todayLog: todayLog ? serializeHabitLog(todayLog) : null,
    logHistory: logHistory.map(serializeHabitLog),
  };
}

export async function hasRecentlyFailedStreak(habitId: string, timezone: string): Promise<boolean> {
  const twoDaysAgo = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  })();

  const failed = await db.query.streaks.findFirst({
    where: and(
      eq(streaks.habitId, habitId),
      eq(streaks.status, 'failed'),
    ),
    orderBy: (s, { desc }) => [desc(s.updatedAt)],
  });

  if (!failed || !failed.updatedAt) return false;

  const failedDate = new Date(failed.updatedAt).toISOString().slice(0, 10);
  return failedDate >= twoDaysAgo;
}

export async function getStreakLogs(streakId: string) {
  return db.query.habitLogs.findMany({
    where: eq(habitLogs.streakId, streakId),
    orderBy: (l, { asc }) => [asc(l.date)],
  });
}

export async function validateActiveStreaks(userId: string, timezone: string): Promise<string[]> {
  const today = todayForTimezone(timezone);

  const userHabits = await db.query.habits.findMany({
    where: and(eq(habits.userId, userId), eq(habits.isActive, true)),
    columns: { id: true },
  });
  const habitIds = userHabits.map((h) => h.id);

  if (habitIds.length === 0) return [];

  const activeStreaks = await db.query.streaks.findMany({
    where: sql`${streaks.habitId} IN ${habitIds} AND ${streaks.status} = 'active'`,
  });

  const broken: string[] = [];

  for (const streak of activeStreaks) {
    const lastLog = await db.query.habitLogs.findFirst({
      where: eq(habitLogs.streakId, streak.id),
      orderBy: desc(habitLogs.date),
      columns: { date: true },
    });

    if (!lastLog) continue;

    const lastDate = new Date(lastLog.date + 'T12:00:00');
    const todayDate = new Date(today + 'T12:00:00');
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      await db
        .update(streaks)
        .set({
          status: 'failed',
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(streaks.id, streak.id));

      const habit = await db.query.habits.findFirst({
        where: eq(habits.id, streak.habitId),
        columns: { title: true },
      });
      if (habit) broken.push(habit.title);
    }
  }

  return broken;
}

export async function runHourlyCron() {
  const allUsers = await db.query.users.findMany({
    columns: { id: true, timezone: true },
  });

  const timezoneMap = new Map<string, string[]>();
  for (const user of allUsers) {
    const tz = user.timezone || 'UTC';
    if (!timezoneMap.has(tz)) timezoneMap.set(tz, []);
    timezoneMap.get(tz)!.push(user.id);
  }

  for (const [tz, userIds] of timezoneMap) {
    const hourInTz = getHourInTimezone(tz);
    if (hourInTz !== 0) continue;

    const today = todayForTimezone(tz);
    const yesterday = (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();

    console.log(`[Cron] Processing timezone ${tz} (${userIds.length} users), today=${today}, yesterday=${yesterday}`);

    for (const userId of userIds) {
      try {
        const userHabits = await db.query.habits.findMany({
          where: and(eq(habits.userId, userId), eq(habits.isActive, true)),
          columns: { id: true },
        });

        for (const habit of userHabits) {
          const activeStreak = await db.query.streaks.findFirst({
            where: and(eq(streaks.habitId, habit.id), eq(streaks.status, 'active')),
          });

          if (!activeStreak) continue;

          const yesterdayLog = await db.query.habitLogs.findFirst({
            where: and(eq(habitLogs.streakId, activeStreak.id), eq(habitLogs.date, yesterday)),
          });

          if (!yesterdayLog) {
            await db
              .update(streaks)
              .set({
                status: 'failed',
                archivedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(streaks.id, activeStreak.id));

            await createStreak(habit.id, userId, tz);

            console.log(`[Cron] Streak ${activeStreak.id} reset for user ${userId} (no log for ${yesterday} in ${tz})`);
          }
        }
      } catch (err) {
        console.error(`[Cron] Error processing user ${userId}:`, err);
      }
    }
  }
}

export async function getStreakHistory(habitId: string, userId: string): Promise<StreakHistory | null> {
  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, habitId), eq(habits.userId, userId)),
    columns: { id: true, title: true },
  });
  if (!habit) return null;

  const allStreaks = await db.query.streaks.findMany({
    where: eq(streaks.habitId, habitId),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });

  if (allStreaks.length === 0) {
    return {
      habitId,
      habitTitle: habit.title,
      totalAttempts: 0,
      bestStreak: 0,
      completedCount: 0,
      recoveryRate: 0,
      avgDaysBeforeFail: 0,
      typicalFailDay: 0,
      attempts: [],
    };
  }

  const attempts: StreakAttempt[] = allStreaks.map((s, i) => ({
    attemptNumber: i + 1,
    startDate: s.startDate,
    currentDay: s.currentDay,
    status: s.status,
    archivedAt: s.archivedAt ? new Date(s.archivedAt).toISOString() : null,
    createdAt: new Date(s.createdAt).toISOString(),
  }));

  const bestStreak = Math.max(...allStreaks.map((s) => s.currentDay));
  const completedCount = allStreaks.filter((s) => s.status === 'completed').length;
  const failedStreaks = allStreaks.filter((s) => s.status === 'failed');
  const totalAfterFirst = allStreaks.length > 1 ? allStreaks.length - 1 : 0;
  const recoveryRate = totalAfterFirst > 0
    ? Math.round((failedStreaks.length / totalAfterFirst) * 100)
    : 0;

  const avgDaysBeforeFail = failedStreaks.length > 0
    ? Math.round(failedStreaks.reduce((sum, s) => sum + s.currentDay, 0) / failedStreaks.length)
    : 0;

  const failDays = failedStreaks.map((s) => s.currentDay);
  const typicalFailDay = failDays.length > 0
    ? failDays.sort((a, b) => failDays.filter((v) => v === a).length - failDays.filter((v) => v === b).length).pop()!
    : 0;

  return {
    habitId,
    habitTitle: habit.title,
    totalAttempts: allStreaks.length,
    bestStreak,
    completedCount,
    recoveryRate,
    avgDaysBeforeFail,
    typicalFailDay,
    attempts,
  };
}
