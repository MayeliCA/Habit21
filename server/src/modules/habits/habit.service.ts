import type { Request, Response } from 'express';
import { z } from 'zod';
import { eq, and, count } from 'drizzle-orm';
import { db } from '../../db';
import { habits } from '../../db/schema';

const MAX_HABITS = 6;

export const createHabitSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['academic', 'vital', 'personal', 'escape']).optional(),
  description: z.string().max(1000).optional(),
});

export const updateHabitSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['academic', 'vital', 'personal', 'escape']).optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

export async function listHabits(req: Request, res: Response) {
  const result = await db.query.habits.findMany({
    where: and(eq(habits.userId, req.user!.userId), eq(habits.isActive, true)),
    orderBy: (habits, { desc }) => [desc(habits.createdAt)],
  });
  return res.json(result);
}

export async function createHabit(req: Request, res: Response) {
  const input = createHabitSchema.parse(req.body);

  const [row] = await db
    .select({ count: count() })
    .from(habits)
    .where(and(eq(habits.userId, req.user!.userId), eq(habits.isActive, true)));

  if (row.count >= MAX_HABITS) {
    return res.status(400).json({ error: 'Maximum of 6 active habits reached' });
  }

  const [habit] = await db
    .insert(habits)
    .values({ userId: req.user!.userId, ...input })
    .returning();
  return res.status(201).json(habit);
}

export async function updateHabit(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const input = updateHabitSchema.parse(req.body);
  const [updated] = await db
    .update(habits)
    .set(input)
    .where(and(eq(habits.id, id), eq(habits.userId, req.user!.userId)))
    .returning();
  if (!updated) return res.status(404).json({ error: 'Habit not found' });
  return res.json(updated);
}

export async function deleteHabit(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const [deleted] = await db
    .update(habits)
    .set({ isActive: false })
    .where(and(eq(habits.id, id), eq(habits.userId, req.user!.userId)))
    .returning();
  if (!deleted) return res.status(404).json({ error: 'Habit not found' });
  return res.json({ message: 'Habit deactivated' });
}
