import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FormGroup, FormControlLabel, Checkbox, Button, Typography, 
  CircularProgress, TextField, Box, Snackbar 
} from '@mui/material';
import { updateUserPreferences } from '../slices/userSlice';
import { AppDispatch, RootState } from '../store';
import { fetchContracts } from '../slices/contractSlice';
import { UserPreferences } from '../types';
import SubscriberRegistration from './SubscriberRegistration';

function AlertCustomization() {
  const dispatch = useDispatch<AppDispatch>();
  const { preferences, loading, isVerified } = useSelector((state: RootState) => state.user);
  const { categories, loading: contractsLoading } = useSelector((state: RootState) => state.contracts);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(preferences?.categories || []);
  const [alertPreferences, setAlertPreferences] = useState(preferences?.alertPreferences || {
    dailyUpdates: false,
    bigMoves: false
  });
  const [phoneNumber, setPhoneNumber] = useState(preferences?.phoneNumber || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    console.log('AlertCustomization useEffect - isVerified:', isVerified);
    console.log('AlertCustomization useEffect - categories:', categories);
    if (categories.length === 0) {
      dispatch(fetchContracts());
    }
  }, [dispatch, categories, isVerified]);

  useEffect(() => {
    console.log('AlertCustomization useEffect - preferences updated:', preferences);
    if (preferences) {
      setSelectedCategories(preferences.categories || []);
      setAlertPreferences(preferences.alertPreferences || { dailyUpdates: false, bigMoves: false });
      setPhoneNumber(preferences.phoneNumber || '');
    }
  }, [preferences]);

  console.log('AlertCustomization rendering');
  console.log('Is Verified:', isVerified);
  console.log('Categories:', categories);
  console.log('Selected Categories:', selectedCategories);
  console.log('Alert Preferences:', alertPreferences);
  console.log('Phone Number:', phoneNumber);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setSelectedCategories(prev => 
      checked ? [...prev, name] : prev.filter(category => category !== name)
    );
  };

  const handleAlertPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setAlertPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    if (!alertPreferences.dailyUpdates && !alertPreferences.bigMoves) {
      setError('Please select at least one alert type');
      return;
    }

    const phoneRegex = /^\d{3}[-]?\d{3}[-]?\d{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      setError('Invalid phone number. Please enter a 10-digit number.');
      return;
    }

    const updatedPreferences: UserPreferences = {
      categories: selectedCategories,
      alertPreferences,
      phoneNumber: phoneNumber.replace(/\D/g, '')
    };
    
    console.log('Sending preferences:', updatedPreferences);
    
    dispatch(updateUserPreferences(updatedPreferences))
      .unwrap()
      .then((result: { subscriber: UserPreferences }) => {
        console.log('Server response:', result);
        setSuccess(true);
      })
      .catch((err: Error) => {
        console.error('Error updating preferences:', err);
        setError(err.message);
      });
  };

  if (contractsLoading) {
    console.log('Contracts loading...');
    return <CircularProgress />;
  }
  
  if (!categories || categories.length === 0) {
    console.log('No categories available');
    return <Typography>No categories available.</Typography>;
  }

  console.log('Rendering main component content');
  return (
    <Box sx={{ mt: 3 }}>
      {!isVerified ? (
        <SubscriberRegistration />
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6">Select Categories</Typography>
          <FormGroup>
            {categories.map(category => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onChange={handleCategoryChange}
                    name={category}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>

          <Typography variant="h6" sx={{ mt: 2 }}>Alert Preferences</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertPreferences.dailyUpdates}
                  onChange={handleAlertPreferenceChange}
                  name="dailyUpdates"
                />
              }
              label="Daily Updates"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={alertPreferences.bigMoves}
                  onChange={handleAlertPreferenceChange}
                  name="bigMoves"
                />
              }
              label="Big Moves"
            />
          </FormGroup>

          <TextField
            fullWidth
            label="Phone Number"
            variant="outlined"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            sx={{ mt: 2 }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={loading} 
            sx={{ mt: 2 }}
          >
            {loading ? 'Updating...' : 'Save Preferences'}
          </Button>
        </Box>
      )}

      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        message="Preferences saved successfully"
      />
    </Box>
  );
}

export default AlertCustomization;