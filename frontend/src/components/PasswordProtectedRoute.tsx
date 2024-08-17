import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

interface PasswordProtectedRouteProps {
  isAuthenticated: boolean;
  onAuthenticate: () => void;
  children: React.ReactNode;
}

const PasswordProtectedRoute: React.FC<PasswordProtectedRouteProps> = ({ 
  isAuthenticated, 
  onAuthenticate, 
  children 
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/verify-password', { password });
      if (response.data.success) {
        onAuthenticate();
      } else {
        setError('Incorrect password');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit} 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mt: 4 
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom>
        Admin Access
      </Typography>
      <TextField
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        label="Password"
        variant="outlined"
        error={!!error}
        helperText={error}
        sx={{ mb: 2 }}
      />
      <Button type="submit" variant="contained" color="primary">
        Enter
      </Button>
    </Box>
  );
};

export default PasswordProtectedRoute;