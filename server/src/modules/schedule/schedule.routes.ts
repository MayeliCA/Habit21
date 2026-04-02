import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as scheduleService from './schedule.service';

const router = Router();

router.use(authenticate);

router.get('/today', scheduleService.getTodayStatus);
router.get('/', scheduleService.listActivities);
router.post('/', scheduleService.createActivity);
router.patch('/:id', scheduleService.updateActivity);
router.delete('/:id', scheduleService.deleteActivity);

export default router;
