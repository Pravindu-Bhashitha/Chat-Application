import { Router } from 'express';
import { register, login, getUsers } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', verifyToken, getUsers);

export default router;