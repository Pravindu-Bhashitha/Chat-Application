import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// router.get('/users', verifyToken, getUsers);

export default router;