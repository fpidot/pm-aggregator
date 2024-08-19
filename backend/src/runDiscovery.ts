import { discoverAllContracts } from './services/marketDiscoveryService';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runDiscovery() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    console.log('Starting contract discovery...');
    const contracts = await discoverAllContracts();
    console.log(`Discovered ${contracts.length} contracts`);

    // Optionally, you can log more details about the contracts here
    // console.log('Discovered contracts:', JSON.stringify(contracts, null, 2));
  } catch (error) {
    console.error('Error during discovery:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

runDiscovery();