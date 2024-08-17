import express from 'express';
import { sendDailyUpdate } from '../services/alertService';

const router = express.Router();

router.post('/trigger-daily-update', async (req, res) => {
  try {
    await sendDailyUpdate();
    res.status(200).json({ message: 'Daily update triggered successfully' });
  } catch (error) {
    console.error('Error triggering daily update:', error);
    res.status(500).json({ message: 'Error triggering daily update' });
  }
});

export default router;