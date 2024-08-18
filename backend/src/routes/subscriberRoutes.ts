import express from 'express';
import Subscriber from '../models/Subscriber';
import logger from '../utils/logger';
import { sendSMS, formatPhoneNumber } from '../services/smsService';
import { generateConfirmationCode } from '../utils/codeGenerator';
import AdminSettings from '../models/AdminSettings';

const router = express.Router();

router.post('/preferences', async (req, res) => {
  try {
    console.log('Received request to update preferences:', req.body);
    const { phoneNumber, categories, alertPreferences } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    // Validate input
    if (!formattedPhoneNumber || !categories || !alertPreferences) {
      console.warn('Missing required fields in request');
      return res.status(400).json({ message: 'Missing required fields' });
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

    let subscriber = await Subscriber.findOne({ phoneNumber: formattedPhoneNumber });
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    subscriber.categories = categories;
    subscriber.alertPreferences = alertPreferences;

    console.log('Saving subscriber with preferences:', subscriber);
    await subscriber.save();
    console.log('Subscriber preferences saved successfully');

    const responseData = {
      message: 'Preferences saved successfully',
      preferences: {
        phoneNumber: subscriber.phoneNumber,
        categories: subscriber.categories,
        alertPreferences: subscriber.alertPreferences
      }
    };
    console.log('Sending response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error saving subscriber preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route for registration
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    let subscriber = await Subscriber.findOne({ phoneNumber: formattedPhoneNumber });
    const confirmationCode = generateConfirmationCode();

    if (subscriber) {
      subscriber.confirmationCode = confirmationCode;
      subscriber.isVerified = false;
    } else {
      subscriber = new Subscriber({
        phoneNumber: formattedPhoneNumber,
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
    
    // Fetch categories from AdminSettings
    const adminSettings = await AdminSettings.findOne();
    if (!adminSettings) {
      return res.status(500).json({ message: 'Admin settings not found' });
    }

    // Set default preferences
    subscriber.categories = adminSettings.categories;
    subscriber.alertPreferences = { dailyUpdates: true, bigMoves: true };

    await subscriber.save();
    console.log('Verification successful:', { 
      phoneNumber: formattedPhoneNumber, 
      categories: subscriber.categories,
      alertPreferences: subscriber.alertPreferences
    });

    res.status(200).json({ 
      message: 'Phone number verified successfully',
      phoneNumber: formattedPhoneNumber,
      categories: subscriber.categories,
      alertPreferences: subscriber.alertPreferences
    });
  } catch (error) {
    console.error('Error verifying subscriber:', error);
    res.status(500).json({ message: 'Error verifying subscriber' });
  }
});

export default router;