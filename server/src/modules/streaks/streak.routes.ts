import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as streakController from './streak.controller';

const router = Router();

router.use(authenticate);

router.get('/', streakController.listStreaks);
router.get('/:id', streakController.getStreakDetail);
router.post('/habit/:habitId/start', streakController.startStreak);
router.post('/:id/log', streakController.logToday);

export default router;
