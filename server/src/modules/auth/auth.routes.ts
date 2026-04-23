import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as authService from './auth.service';

const router = Router();

router.post('/register', authService.register);
router.post('/login', authService.login);
router.patch('/timezone', authenticate, authService.updateTimezone);

export default router;
