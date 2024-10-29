import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createFlockDetail,
  getFlockDetails,
  getFlockDetailById,
} from '../controllers/flockDetailController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + '-' + file.fieldname + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// Update the route to handle multiple files
router.post(
  '/',
  upload.fields([
    { name: 'image_mortality', maxCount: 1 },
    { name: 'feed_image', maxCount: 1 },
    { name: 'field_image', maxCount: 1 },
  ]),
  createFlockDetail
);

router.get('/', getFlockDetails);
router.get('/:id', getFlockDetailById);

export default router;
