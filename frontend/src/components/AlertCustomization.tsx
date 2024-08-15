import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormGroup, FormControlLabel, Checkbox, Button, Typography, CircularProgress } from '@mui/material';
import { updateUserPreferences } from '../slices/userSlice';
import { RootState } from '../store';
import { fetchContracts } from '../slices/contractSlice';

function AlertCustomization() {
  const dispatch = useDispatch();
  const { preferences, loading: userLoading } = useSelector((state: RootState) => state.user);
  const { categories, loading: contractsLoading } = useSelector((state: RootState) => state.contracts);

  const [selectedCategories, setSelectedCategories] = useState(preferences.categories);
  const [alertTypes, setAlertTypes] = useState(preferences.alertTypes);

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(updateUserPreferences({ categories: selectedCategories, alertTypes }) as any);
  };

  if (contractsLoading) return <CircularProgress />;
  if (!categories || categories.length === 0) return <Typography>No categories available.</Typography>;

  return (
    <form onSubmit={handleSubmit}>
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

      {/* ... rest of the form ... */}
    </form>
  );
}

export default AlertCustomization;