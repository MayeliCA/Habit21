import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as analyticsService from './analytics.service';
import { todayForTimezone } from '../../utils/date';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const today = todayForTimezone(req.user!.timezone);
  const date = (req.query.date as string) || today;
  const result = await analyticsService.getAnalytics(req.user!.userId, date);
  return res.json(result);
});

router.get('/schedule-streak', async (req, res) => {
  const today = todayForTimezone(req.user!.timezone);
  const result = await analyticsService.getScheduleStreak(req.user!.userId, today);
  return res.json(result);
});

router.get('/monthly-dots', async (req, res) => {
  const today = todayForTimezone(req.user!.timezone);
  const month = req.query.month as string | undefined;
  const result = await analyticsService.getMonthlyDots(req.user!.userId, month, today);
  return res.json(result);
});

router.get('/day-detail', async (req, res) => {
  const today = todayForTimezone(req.user!.timezone);
  const date = (req.query.date as string) || today;
  const result = await analyticsService.getDayDetail(req.user!.userId, date);
  return res.json(result);
});

router.get('/week-comparison', async (req, res) => {
  const today = todayForTimezone(req.user!.timezone);
  const result = await analyticsService.getWeekComparison(req.user!.userId, today);
  return res.json(result);
});

export default router;
