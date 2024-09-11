import express from 'express';
import { getAllBooks, createBook } from '../controllers/bookController.js';
import { authenticateToken } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get(
  '/',
  authenticateToken,
  checkRole(['admin', 'superadmin']),
  getAllBooks
);
router.post(
  '/',
  authenticateToken,
  checkRole(['admin', 'superadmin']),
  createBook
);

export default router;
