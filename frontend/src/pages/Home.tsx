import React from 'react';
import { Container, Typography } from '@mui/material';
import Homepage from '../components/Homepage';
import AlertCustomization from '../components/AlertCustomization';

function Home() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
           Prediction Market Aggregator
      </Typography>
      <Homepage />
      <AlertCustomization />
    </Container>
  );
}

export default Home;