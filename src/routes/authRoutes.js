import express from 'express';
import {
  login,
  signup,
  refreshToken,
  logout,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.post('/login', login);
// Here 0 is Superadmin and 1 is admin
router.post('/signup', authenticateToken, checkRole([0, 1]), signup);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;
