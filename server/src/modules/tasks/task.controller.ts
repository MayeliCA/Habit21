import type { Request, Response } from 'express';
import { todayForTimezone } from '../../utils/date';
import * as taskService from './task.service';

export async function getDailyTasks(req: Request, res: Response) {
  const today = todayForTimezone(req.user!.timezone);
  const date = (req.query.date as string) || today;
  const tasks = await taskService.getActivitiesForDate(req.user!.userId, date);
  return res.json(tasks);
}

export async function toggleTask(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const today = todayForTimezone(req.user!.timezone);
  const updated = await taskService.toggleActivityDone(req.user!.userId, id, today);
  if (!updated) return res.status(404).json({ error: 'Activity not found' });
  return res.json(updated);
}
