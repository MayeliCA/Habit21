import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as taskController from './task.controller';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getDailyTasks);
router.patch('/:id/toggle', taskController.toggleTask);

export default router;
