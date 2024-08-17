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

function AlertCustomization() {
  const dispatch = useDispatch<AppDispatch>();
  const { preferences, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { categories, loading: contractsLoading } = useSelector((state: RootState) => state.contracts);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(preferences.categories);
  const [alertPreferences, setAlertPreferences] = useState(preferences.alertPreferences);
  const [phoneNumber, setPhoneNumber] = useState(preferences.phoneNumber);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchContracts() as any);
    }
  }, [dispatch, categories]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedCategories([...selectedCategories, name]);
    } else {
      setSelectedCategories(selectedCategories.filter(category => category !== name));
    }
  };

  const handleAlertPreferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setAlertPreferences({ ...alertPreferences, [name]: checked });
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validate at least one category is selected
    if (selectedCategories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    // Validate at least one alert type is selected
    if (!alertPreferences.dailyUpdates && !alertPreferences.bigMoves) {
      setError('Please select at least one alert type');
      return;
    }

    // Phone number validation (10 digits, ignoring dashes)
    const phoneRegex = /^\d{3}[-]?\d{3}[-]?\d{4}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\D/g, ''))) {
      setError('Invalid phone number. Please enter a 10-digit number.');
      return;
    }

    const updatedPreferences: UserPreferences = {
      categories: selectedCategories,
      alertPreferences,
      phoneNumber: phoneNumber.replace(/\D/g, '') // Store only digits
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

  if (contractsLoading) return <CircularProgress />;
  if (!categories || categories.length === 0) return <Typography>No categories available.</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
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
        disabled={userLoading} 
        sx={{ mt: 2 }}
      >
        {userLoading ? 'Updating...' : 'Save Preferences'}
      </Button>

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