import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createFlockDetail,
  getFlockDetails,
  getFlockDetailById,
  updateFlockDetail,
  deleteFlockDetail,
  getsingleFlockDetailById,
  getAnalysis,
} from '../controllers/flockDetailController.js';
import { checkRole } from '../middleware/roleCheck.js';
import { authenticateToken } from '../middleware/auth.js';

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
// THis routes gets all flock detail matching the flock_id
router.get('/:id', getFlockDetailById);
// This routes gets the single flock detail matching the flock_detail_id
router.get('/singledetail/:id', getsingleFlockDetailById);
// This router gets the fcr of a particular flock
router.get('/getanalysis/:id', authenticateToken, getAnalysis);
router.put(
  '/:id',
  authenticateToken,
  upload.fields([
    { name: 'image_mortality', maxCount: 1 },
    { name: 'feed_image', maxCount: 1 },
    { name: 'field_image', maxCount: 1 },
  ]),
  checkRole([0, 1]),
  updateFlockDetail
);

router.delete('/:id', authenticateToken, checkRole([0, 1]), deleteFlockDetail);
export default router;
