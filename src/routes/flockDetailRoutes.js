import express from 'express';

import {
  createFlockDetail,
  getFlockDetails,
  getFlockDetailById,
} from '../controllers/flockDetailController.js';

const router = express.Router();

router.post('/', createFlockDetail);
router.get('/', getFlockDetails);
// New route to get flock details by id
router.get('/:id', getFlockDetailById); // id represents flock_id
export default router;
