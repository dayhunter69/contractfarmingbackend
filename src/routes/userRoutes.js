import express from 'express';
import { getUserById, getUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', authenticateToken, checkRole([0, 1]), getUsers);
router.get('/:id', authenticateToken, checkRole([0, 1]), getUserById);
export default router;
