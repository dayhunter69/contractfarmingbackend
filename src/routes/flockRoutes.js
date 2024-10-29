import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import {
  createFlock,
  getFlock,
  getFlockById,
} from '../controllers/flockController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Modify the createFlock route to handle file upload
router.post('/', authenticateToken, upload.single('image'), createFlock);
router.get(
  '/',
  authenticateToken,
  (req, res, next) => {
    req.userRole = Number(req.user.role);
    next();
  },
  getFlock
);
router.get('/:id', authenticateToken, getFlockById);

export default router;
