import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as analyticsService from './analytics.service';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
  const result = await analyticsService.getAnalytics(req.user!.userId, date);
  return res.json(result);
});

export default router;
