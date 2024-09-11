import express from 'express';

import {
  createFlock,
  getFlock,
  getFlockById,
} from '../controllers/flockController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();

router.post('/', authenticateToken, createFlock);
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    req.userRole = Number(req.user.role);
    next();
  },
  getFlock
);
router.get('/:id', authenticateToken, getFlockById); // id represents flock_id
export default router;
