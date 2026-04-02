import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { scheduleActivities, scheduleActivityLogs } from '../../db/schema';

function getJsDay(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay();
}

export async function getActivitiesForDate(userId: string, dateStr: string) {
  const jsDay = getJsDay(dateStr);

  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
    orderBy: (a, { asc }) => [asc(a.time)],
  });

  const filtered = activities.filter((a) => a.daysOfWeek.includes(jsDay));

  const logs = await db.query.scheduleActivityLogs.findMany({
    where: and(eq(scheduleActivityLogs.userId, userId), eq(scheduleActivityLogs.date, dateStr)),
  });

  const logMap = new Map(logs.map((l) => [l.activityId, l]));

  return filtered.map((a) => ({
    ...a,
    log: logMap.get(a.id) || null,
  }));
}

export async function toggleActivityDone(userId: string, activityId: string, dateStr: string) {
  const activity = await db.query.scheduleActivities.findFirst({
    where: and(eq(scheduleActivities.id, activityId), eq(scheduleActivities.userId, userId)),
  });
  if (!activity) return null;

  const existing = await db.query.scheduleActivityLogs.findFirst({
    where: and(eq(scheduleActivityLogs.activityId, activityId), eq(scheduleActivityLogs.date, dateStr)),
  });

  if (existing) {
    const newDone = !existing.done;
    const [updated] = await db
      .update(scheduleActivityLogs)
      .set({ done: newDone, doneAt: newDone ? new Date() : null })
      .where(eq(scheduleActivityLogs.id, existing.id))
      .returning();
    return { ...activity, log: updated };
  }

  const [log] = await db
    .insert(scheduleActivityLogs)
    .values({ activityId, userId, date: dateStr, done: true, doneAt: new Date() })
    .returning();

  return { ...activity, log };
}
