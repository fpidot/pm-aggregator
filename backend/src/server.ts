import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import logger from './utils/logger';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { updatePrices } from './services/priceUpdateService';
import contractRoutes from './routes/contracts';
import subscriberRoutes from './routes/subscriberRoutes';
import adminRoutes from './routes/adminRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from your frontend
  credentials: true,
}));

// Routes
app.use('/api/contracts', contractRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/admin', adminRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    logger.info(`Connected to MongoDB: ${process.env.MONGODB_URI}`);
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Set up a cron job to run updatePrices every minute
    cron.schedule('* * * * *', async () => {
      logger.info('Running scheduled price update');
      await updatePrices();
    });
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error);
  });

  mongoose.connection.on('error', err => {
    logger.error('MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
  
// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;