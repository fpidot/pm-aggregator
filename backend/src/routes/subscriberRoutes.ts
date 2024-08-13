import express from 'express';
import * as subscriberService from '../services/subscriberService';

const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Subscriber routes placeholder' });
});

export default router;