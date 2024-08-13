import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contractRoutes from './routes/contracts';
import cron from 'node-cron';
import { discoverAllContracts, updateFollowedContractPrices } from './services/marketDiscoveryService';
import subscriberRoutes from './routes/subscriberRoutes';
import adminRoutes from './routes/adminRoutes';
import { scheduleUpdates } from './services/priceUpdateService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Schedule contract discovery to run every 6 hours
cron.schedule('0 */6 * * *', () => {
    console.log('Running scheduled contract discovery');
    discoverAllContracts();
  });

// Schedule price updates for followed contracts every minute
cron.schedule('* * * * *', () => {
    console.log('Updating prices for followed contracts');
    updateFollowedContractPrices();
  });
  
  // Run initial discovery on server start
  discoverAllContracts();

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json());

app.use('/api/contracts', contractRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Prediction Market Aggregator API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

scheduleUpdates().catch(error => {
    console.error('Failed to start price update scheduler:', error);
  });