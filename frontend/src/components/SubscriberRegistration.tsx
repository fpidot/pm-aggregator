import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Typography, Box } from '@mui/material';
import { registerSubscriber, verifySubscriber } from '../slices/userSlice';

const SubscriberRegistration: React.FC = () => {
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    try {
      await dispatch(registerSubscriber(phoneNumber) as any);
      setIsCodeSent(true);
      setMessage('Confirmation code sent. Please check your phone.');
    } catch (error) {
      setMessage('Error sending confirmation code. Please try again.');
    }
  };

  const handleVerify = async () => {
    try {
      await dispatch(verifySubscriber({ phoneNumber, confirmationCode }) as any);
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
          />
          <Button onClick={handleSendCode}>Send Confirmation Code</Button>
        </>
      ) : (
        <>
          <TextField
            label="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
          />
          <Button onClick={handleVerify}>Verify</Button>
        </>
      )}
      <Typography>{message}</Typography>
    </Box>
  );
};

export default SubscriberRegistration;