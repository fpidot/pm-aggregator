import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FormGroup, FormControlLabel, Checkbox, Button, Typography, 
  CircularProgress, TextField, Box 
} from '@mui/material';
import { updateUserPreferences } from '../slices/userSlice';
import { RootState } from '../store';
import { fetchContracts } from '../slices/contractSlice';
import { UserPreferences } from '../types'; // Adjust the path as necessary

function AlertCustomization() {
  const dispatch = useDispatch();
  const { preferences, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { categories, loading: contractsLoading } = useSelector((state: RootState) => state.contracts);

  const [selectedCategories, setSelectedCategories] = useState(preferences.categories);
  const [alertTypes, setAlertTypes] = useState({
    dailyUpdates: false,
    bigMoves: false
  });
  const [phoneNumber, setPhoneNumber] = useState(preferences.phoneNumber || '');

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

  const handleAlertTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setAlertTypes({ ...alertTypes, [name]: checked });
  };

  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(updateUserPreferences({
      categories: selectedCategories,
      alertTypes,
      phoneNumber
    } as UserPreferences) as any);
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

      <Typography variant="h6" sx={{ mt: 2 }}>Alert Types</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={alertTypes.dailyUpdates}
              onChange={handleAlertTypeChange}
              name="dailyUpdates"
            />
          }
          label="Daily Updates"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={alertTypes.bigMoves}
              onChange={handleAlertTypeChange}
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
    </Box>
  );
}

export default AlertCustomization;