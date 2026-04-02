import type { Request, Response } from 'express';
import * as taskService from './task.service';

export async function getDailyTasks(req: Request, res: Response) {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const tasks = await taskService.getActivitiesForDate(req.user!.userId, date);
  return res.json(tasks);
}

export async function toggleTask(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const updated = await taskService.toggleActivityDone(req.user!.userId, id, date);
  if (!updated) return res.status(404).json({ error: 'Activity not found' });
  return res.json(updated);
}
