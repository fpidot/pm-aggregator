import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import axios from 'axios';

const AdminPanel: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('');

  const triggerDailyUpdate = async () => {
    try {
      setUpdateStatus('Triggering daily update...');
      const response = await axios.post('/api/alerts/trigger-daily-update');
      setUpdateStatus(response.data.message);
    } catch (error) {
      console.error('Error triggering daily update:', error);
      setUpdateStatus('Error triggering daily update. Please try again.');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Admin Panel</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={triggerDailyUpdate}
        sx={{ mt: 2 }}
      >
        Trigger Daily Update
      </Button>
      {updateStatus && (
        <Typography sx={{ mt: 2 }}>{updateStatus}</Typography>
      )}
      {/* Add other admin controls here */}
    </Box>
  );
};

export default AdminPanel;