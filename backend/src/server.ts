import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import contractRoutes from './routes/contracts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.use(cors());
app.use(express.json());

app.use('/api/contracts', contractRoutes);

app.get('/', (req, res) => {
  res.send('Prediction Market Aggregator API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});