import express from 'express';
import Subscriber, { ISubscriber } from '../models/Subscriber';

const router = express.Router();

router.post('/preferences', async (req, res) => {
  try {
    const { phoneNumber, categories, alertTypes } = req.body;

    let subscriber: ISubscriber | null = await Subscriber.findOne({ phoneNumber });

    if (subscriber) {
      // Update existing subscriber
      subscriber.categories = categories;
      subscriber.alertPreferences = alertTypes;
      await subscriber.save();
    } else {
      // Create new subscriber
      subscriber = new Subscriber({
        phoneNumber,
        categories,
        alertPreferences: alertTypes
      });
      await subscriber.save();
    }

    res.status(200).json({ message: 'Preferences saved successfully', subscriber });
  } catch (error) {
    console.error('Error saving subscriber preferences:', error);
    res.status(500).json({ message: 'Error saving preferences', error: error.message });
  }
});

export default router;