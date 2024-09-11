import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json('Hello! This is from backend! INDEX ROUTE');
});

export default router;
