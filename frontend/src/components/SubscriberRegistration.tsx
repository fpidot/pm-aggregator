import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { registerSubscriber, verifySubscriber } from '../slices/userSlice';
import { AppDispatch, RootState } from '../store';

const SubscriberRegistration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [message, setMessage] = useState('');

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^\+?1?\d{10}$/;
    return phoneRegex.test(number);
  };

  const handleSendCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      await dispatch(registerSubscriber(phoneNumber)).unwrap();
      setIsCodeSent(true);
      setMessage('Confirmation code sent. Please check your phone.');
    } catch (error) {
      setMessage('Error sending confirmation code. Please try again.');
    }
  };

  const handleVerify = async () => {
    try {
      await dispatch(verifySubscriber({ phoneNumber, confirmationCode })).unwrap();
      setMessage('Phone number verified successfully!');
      // Redirect to AlertCustomization or next step
    } catch (error) {
      setMessage('Error verifying code. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant="h6">Subscribe to Alerts</Typography>
      {!isCodeSent ? (
        <>
          <TextField
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleSendCode} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Send Confirmation Code'}
          </Button>
        </>
      ) : (
        <>
          <TextField
            label="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Verify'}
          </Button>
        </>
      )}
      <Typography color={error ? 'error' : 'inherit'}>
        {message || (error && typeof error === 'string' ? error : '')}
      </Typography>
    </Box>
  );
};

export default SubscriberRegistration;