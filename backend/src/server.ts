import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contractRoutes from './routes/contracts';
import cron from 'node-cron';
import { discoverAllContracts, updateFollowedContractPrices } from './services/marketDiscoveryService';
import subscriberRoutes from './routes/subscriberRoutes';
import adminRoutes from './routes/adminRoutes';
import logger from './utils/logger';
import { updatePrices } from './services/priceUpdateService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

  mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    logger.info(`Connected to MongoDB: ${process.env.MONGODB_URI}`);
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
    // You may want to call updatePrices() here or set up a schedule for it
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error);
  });

app.use(cors());
app.use(express.json());

app.use('/api/contracts', contractRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Prediction Market Aggregator API');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

scheduleUpdates().catch(error => {
    console.error('Failed to start price update scheduler:', error);
  });

  mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    logger.info(`Connected to MongoDB: ${process.env.MONGODB_URI}`);
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${{PORT}}`);
    });
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error);
  });

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });