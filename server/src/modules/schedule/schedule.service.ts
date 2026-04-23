import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { scheduleActivities, scheduleActivityLogs } from '../../db/schema';
import { todayForTimezone } from '../../utils/date';

const MAX_PER_DAY = 18;

const FULL_DAYS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export const createActivitySchema = z
  .object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    category: z.enum(['academic', 'vital', 'personal', 'escape']),
    activity: z.string().min(1).max(200),
  })
  .refine((data) => data.time < data.endTime, {
    message: 'Start time must be before end time',
    path: ['time'],
  });

export const updateActivitySchema = z
  .object({
    daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    category: z.enum(['academic', 'vital', 'personal', 'escape']).optional(),
    activity: z.string().min(1).max(200).optional(),
  })
  .refine(
    (data) => {
      if (data.time !== undefined && data.endTime !== undefined) {
        return data.time < data.endTime;
      }
      return true;
    },
    { message: 'Start time must be before end time', path: ['time'] },
  );

export async function listActivities(req: Request, res: Response) {
  const userId = req.user!.userId;
  const today = todayForTimezone(req.user!.timezone);

  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
    orderBy: (a, { asc }) => [asc(a.time)],
  });

  const logs = await db.query.scheduleActivityLogs.findMany({
    where: and(eq(scheduleActivityLogs.userId, userId), eq(scheduleActivityLogs.date, today)),
  });

  const logMap = new Map(logs.map((l) => [l.activityId, l]));

  const result = activities.map((a) => ({
    ...a,
    log: logMap.get(a.id) || null,
  }));

  return res.json(result);
}

export async function createActivity(req: Request, res: Response) {
  const userId = req.user!.userId;
  const input = createActivitySchema.parse(req.body);

  const allActivities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
  });

  const countsPerDay: Record<number, number> = {};
  for (let d = 0; d <= 6; d++) countsPerDay[d] = 0;
  for (const a of allActivities) {
    for (const d of a.daysOfWeek) {
      countsPerDay[d] = (countsPerDay[d] || 0) + 1;
    }
  }

  for (const day of input.daysOfWeek) {
    if (countsPerDay[day] >= MAX_PER_DAY) {
      return res.status(409).json({
        error: `No se pueden agregar más actividades para el ${FULL_DAYS[day]} (máximo 18 por día)`,
      });
    }
  }

  const [activity] = await db
    .insert(scheduleActivities)
    .values({
      userId,
      daysOfWeek: input.daysOfWeek,
      time: input.time,
      endTime: input.endTime,
      category: input.category,
      activity: input.activity,
      sortOrder: 0,
    })
    .returning();

  return res.status(201).json({ ...activity, log: null });
}

export async function updateActivity(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const input = updateActivitySchema.parse(req.body);

  const [updated] = await db
    .update(scheduleActivities)
    .set(input)
    .where(and(eq(scheduleActivities.id, id), eq(scheduleActivities.userId, req.user!.userId)))
    .returning();

  if (!updated) return res.status(404).json({ error: 'Activity not found' });
  return res.json(updated);
}

export async function deleteActivity(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;

  const [deleted] = await db
    .delete(scheduleActivities)
    .where(and(eq(scheduleActivities.id, id), eq(scheduleActivities.userId, req.user!.userId)))
    .returning();

  if (!deleted) return res.status(404).json({ error: 'Activity not found' });
  return res.json({ message: 'Activity deleted' });
}

export async function getTodayStatus(req: Request, res: Response) {
  const userId = req.user!.userId;
  const today = todayForTimezone(req.user!.timezone);
  const jsDay = new Date(today + 'T12:00:00').getDay();

  const activities = await db.query.scheduleActivities.findMany({
    where: eq(scheduleActivities.userId, userId),
  });

  const todayActivities = activities.filter((a) => a.daysOfWeek.includes(jsDay));

  const logs = await db.query.scheduleActivityLogs.findMany({
    where: and(eq(scheduleActivityLogs.userId, userId), eq(scheduleActivityLogs.date, today)),
  });

  const doneSet = new Set(logs.filter((l) => l.done).map((l) => l.activityId));
  const completed = todayActivities.filter((a) => doneSet.has(a.id)).length;
  const total = todayActivities.length;
  const compliancePct = total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

  return res.json({ total, completed, compliancePct, passed: compliancePct > 80 });
}
