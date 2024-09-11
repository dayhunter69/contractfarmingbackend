import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/', authenticateToken, checkRole([0, 1]), getUsers);

export default router;
