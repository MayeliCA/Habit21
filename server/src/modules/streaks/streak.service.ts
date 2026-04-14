import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { streaks, habitLogs, habits } from '../../db/schema';
import type { Streak, HabitLog, StreakPreview } from '@shared/types/streak';

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

export async function createStreak(habitId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [streak] = await db
    .insert(streaks)
    .values({
      habitId,
      startDate: today,
      currentDay: 1,
      status: 'active',
    })
    .returning();
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
  const newStatus = newCurrentDay > 21 ? 'completed' : 'active';

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

export async function getStreakPreview(habitId: string): Promise<StreakPreview | null> {
  const streak = await getActiveStreakForHabit(habitId);
  if (!streak) return null;

  const today = new Date().toISOString().slice(0, 10);

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

export async function getStreakLogs(streakId: string) {
  return db.query.habitLogs.findMany({
    where: eq(habitLogs.streakId, streakId),
    orderBy: (l, { asc }) => [asc(l.date)],
  });
}

export async function runMidnightCron() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = (() => {
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  })();

  const activeStreaks = await db.query.streaks.findMany({
    where: eq(streaks.status, 'active'),
  });

  console.log(`[Cron] Processing ${activeStreaks.length} active streaks for ${today}`);

  for (const streak of activeStreaks) {
    try {
      const yesterdayLog = await db.query.habitLogs.findFirst({
        where: and(eq(habitLogs.streakId, streak.id), eq(habitLogs.date, yesterday)),
      });

      if (!yesterdayLog) {
        const habit = await db.query.habits.findFirst({
          where: eq(habits.id, streak.habitId),
        });

        if (habit) {
          await db
            .update(streaks)
            .set({
              status: 'failed',
              archivedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(streaks.id, streak.id));

          await createStreak(streak.habitId);

          console.log(`[Cron] Streak ${streak.id} reset (no log for ${yesterday})`);
        }
      }
    } catch (err) {
      console.error(`[Cron] Error processing streak ${streak.id}:`, err);
    }
  }

  console.log(`[Cron] Completed processing for ${today}`);
}
