import { Router } from 'express';
import authenticateToken from '../middleware/auth.middleware';
import { getMyProfile, getUsers, updateMyProfile } from '../controllers/user.controller';


const router = Router();

router.get('/', authenticateToken, getUsers);
router.get('/me', authenticateToken, getMyProfile);
router.patch('/update-profile', authenticateToken, updateMyProfile);

export default router;