import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import habitRoutes from '../modules/habits/habit.routes';
import scheduleRoutes from '../modules/schedule/schedule.routes';
import taskRoutes from '../modules/tasks/task.routes';
import streakRoutes from '../modules/streaks/streak.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/tasks', taskRoutes);
router.use('/streaks', streakRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
