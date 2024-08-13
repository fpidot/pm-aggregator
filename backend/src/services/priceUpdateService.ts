import Contract, { IContract } from '../models/Contract';
import { getAdminSettings } from './adminService';
import * as predictItService from './predictItService';
import * as kalshiService from './kalshiService';
import * as polymarketService from './polymarketService';
import * as manifoldService from './manifoldService';

export const updatePrices = async (): Promise<void> => {
  const contracts = await Contract.find({ isFollowed: true });
  const updatePromises = contracts.map(updateContractPrice);
  await Promise.all(updatePromises);
};

const updateContractPrice = async (contract: IContract): Promise<void> => {
  let newPrice: number | null = null;

  switch (contract.market) {
    case 'PredictIt':
      newPrice = await predictItService.fetchContractPrice(contract.externalId);
      break;
    case 'Kalshi':
      newPrice = await kalshiService.fetchContractPrice(contract.externalId);
      break;
    case 'Polymarket':
      newPrice = await polymarketService.fetchContractPrice(contract.externalId);
      break;
    case 'Manifold':
      newPrice = await manifoldService.fetchContractPrice(contract.externalId);
      break;
  }

  if (newPrice !== null) {
    contract.currentPrice = newPrice;
    contract.priceHistory.push({ price: newPrice, timestamp: new Date() });
    
    // Keep only the last 24 hours of price history
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    contract.priceHistory = contract.priceHistory.filter(ph => ph.timestamp > twentyFourHoursAgo);

    contract.lastUpdated = new Date();
    await contract.save();
  }
};

export const scheduleUpdates = async (): Promise<void> => {
  const settings = await getAdminSettings();
  const updateIntervalMs = settings.priceUpdateInterval * 60 * 1000; // Convert minutes to milliseconds

  setInterval(async () => {
    try {
      await updatePrices();
      console.log('Price update completed successfully');
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, updateIntervalMs);
};