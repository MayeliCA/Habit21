import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../../db';
import { habits, streaks } from '../../db/schema';
import * as streakService from './streak.service';

export async function listStreaks(req: Request, res: Response) {
  const userHabits = await db.query.habits.findMany({
    where: and(eq(habits.userId, req.user!.userId), eq(habits.isActive, true)),
  });

  const result = [];
  for (const habit of userHabits) {
    const preview = await streakService.getStreakPreview(habit.id);
    result.push({ habit, streak: preview });
  }

  return res.json(result);
}

export async function getStreakDetail(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;

  const streak = await db.query.streaks.findFirst({
    where: eq(streaks.id, id),
  });
  if (!streak) return res.status(404).json({ error: 'Streak not found' });

  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, streak.habitId), eq(habits.userId, req.user!.userId)),
  });
  if (!habit) return res.status(404).json({ error: 'Streak not found' });

  const logs = await streakService.getStreakLogs(streak.id);
  return res.json({ streak, habit, logs });
}

export async function startStreak(req: Request<{ habitId: string }>, res: Response) {
  const { habitId } = req.params;

  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, habitId), eq(habits.userId, req.user!.userId)),
  });
  if (!habit) return res.status(404).json({ error: 'Habit not found' });

  const existing = await streakService.getActiveStreakForHabit(habitId);
  if (existing) return res.status(409).json({ error: 'Active streak already exists for this habit' });

  const streak = await streakService.createStreak(habitId);
  return res.status(201).json(streak);
}

export async function logToday(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const dateStr = (req.query.date as string) || new Date().toISOString().slice(0, 10);

  const result = await streakService.logHabitDay(id, req.user!.userId, dateStr);
  if (!result) return res.status(404).json({ error: 'Streak not found or not active' });

  return res.json(result);
}
