import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as habitService from './habit.service';

const router = Router();

router.use(authenticate);

router.get('/', habitService.listHabits);
router.post('/', habitService.createHabit);
router.patch('/:id', habitService.updateHabit);
router.delete('/:id', habitService.deleteHabit);

export default router;
