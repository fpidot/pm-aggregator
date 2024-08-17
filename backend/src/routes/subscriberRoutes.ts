import express from 'express';
import Subscriber, { ISubscriber } from '../models/Subscriber';
import logger from '../utils/logger';

const router = express.Router();

router.post('/preferences', async (req, res) => {
  try {
    logger.info('Received request to update preferences:', req.body);
    const { phoneNumber, categories, alertPreferences } = req.body;

    // Validate input
    if (!phoneNumber || !categories || !alertPreferences) {
      logger.warn('Missing required fields in request');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate phone number (10 digits, ignoring dashes)
    const phoneRegex = /^\d{3}[-]?\d{3}[-]?\d{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      return res.status(400).json({ message: 'Invalid phone number. Please enter a 10-digit number.' });
    }

    // Validate categories (must be a non-empty array)
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'At least one category must be selected' });
    }

    // Validate alertPreferences (at least one must be true)
    if (typeof alertPreferences !== 'object' || alertPreferences === null || 
        (!alertPreferences.dailyUpdates && !alertPreferences.bigMoves)) {
      return res.status(400).json({ message: 'At least one alert type must be selected' });
    }

    // Find existing subscriber or create a new one
    let subscriber = await Subscriber.findOne({ phoneNumber });
    if (!subscriber) {
      logger.info('Creating new subscriber with phone number:', phoneNumber);
      subscriber = new Subscriber({ phoneNumber });
    } else {
      logger.info('Updating existing subscriber with phone number:', phoneNumber);
    }
    // Update subscriber preferences
    subscriber.categories = categories;
    subscriber.alertPreferences = alertPreferences;

    // Save the updated subscriber
    await subscriber.save();
    logger.info('Subscriber preferences saved successfully');

    res.status(200).json({
      message: 'Preferences saved successfully',
      subscriber: {
        phoneNumber: subscriber.phoneNumber,
        categories: subscriber.categories,
        alertPreferences: subscriber.alertPreferences
      }
    });
  } catch (error) {
    logger.error('Error saving subscriber preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;