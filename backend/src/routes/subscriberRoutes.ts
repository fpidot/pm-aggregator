import express from 'express';
import Subscriber from '../models/Subscriber';
import logger from '../utils/logger';
import { sendSMS, formatPhoneNumber } from '../services/smsService';
import { generateConfirmationCode } from '../utils/codeGenerator';

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

// Route for registration
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, categories, alertPreferences } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    let subscriber = await Subscriber.findOne({ phoneNumber: formattedPhoneNumber });
    console.log('Subscriber saved:', subscriber);
    const confirmationCode = generateConfirmationCode();

    if (subscriber) {
      // If subscriber exists, just update the confirmation code
      subscriber.confirmationCode = confirmationCode;
      subscriber.isVerified = false;
    } else {
      // If new subscriber, create a new document
      subscriber = new Subscriber({
        phoneNumber: formattedPhoneNumber,
        categories,
        alertPreferences,
        confirmationCode,
        isVerified: false
      });
    }

    await subscriber.save();

    try {
      await sendSMS(formattedPhoneNumber, `Your confirmation code is: ${confirmationCode}`);
      res.status(200).json({ message: 'Confirmation code sent. Please verify your number.' });
    } catch (smsError) {
      console.error('Error sending SMS:', smsError);
      res.status(500).json({ message: 'Failed to send confirmation code. Please try again.' });
    }
  } catch (error) {
    console.error('Error registering subscriber:', error);
    res.status(500).json({ message: 'Error registering subscriber' });
  }
});

// New route for verification
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, confirmationCode } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    const subscriber = await Subscriber.findOne({ phoneNumber: formattedPhoneNumber });

    
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    if (subscriber.confirmationCode !== confirmationCode) {
      console.log('Stored code:', subscriber.confirmationCode, 'Received code:', confirmationCode);
      return res.status(400).json({ message: 'Invalid confirmation code' });
    }

    subscriber.isVerified = true;
    subscriber.confirmationCode = undefined;
    await subscriber.save();
    console.log('Verification attempt:', { 
      phoneNumber: formattedPhoneNumber, 
      storedCode: subscriber.confirmationCode, 
      receivedCode: confirmationCode 
    });

    res.status(200).json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Error verifying subscriber:', error);
    res.status(500).json({ message: 'Error verifying subscriber' });
  }
});

export default router;