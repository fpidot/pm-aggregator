import logger from '../utils/logger';
import { IContract } from '../models/Contract';
import { IAdminSettings } from '../models/AdminSettings';
import ContractModel from '../models/Contract';
import AdminSettingsModel from '../models/AdminSettings';
import * as predictItService from './predictItService';
import * as kalshiService from './kalshiService';
import * as polymarketService from './polymarketService';
import * as manifoldService from './manifoldService';
import * as alertService from './alertService';

export async function updatePrices(): Promise<void> {
  logger.info('Starting price update process');
  try {
    const contracts = await ContractModel.find({});
    const adminSettings = await AdminSettingsModel.findOne();

    if (!adminSettings) {
      logger.error('Admin settings not found');
      return;
    }

    for (const contract of contracts) {
      await updateContractPrice(contract, adminSettings);
    }

    logger.info('Price update process completed');
  } catch (error) {
    logger.error('Error in updatePrices:', error);
  }
}

async function updateContractPrice(contract: IContract, adminSettings: IAdminSettings): Promise<void> {
    try {
      const newPrice = await getNewPrice(contract);
  
      if (newPrice !== null) {
        const priceChange = calculatePriceChange(contract, newPrice);
        contract.priceHistory.push({ price: newPrice, timestamp: new Date() });
        contract.currentPrice = newPrice;
  
        const threshold = adminSettings.bigMoveThresholds.get(contract.category);
        if (threshold && Math.abs(priceChange) >= threshold) {
          logger.info(`Big move detected for contract ${contract._id}: ${priceChange}`);
          contract.lastAlertPrice = newPrice;
          contract.lastAlertTime = new Date();
        }
  
        await contract.save();
        logger.info(`Updated price for contract ${contract._id}: ${newPrice}`);
      } else {
        logger.warn(`Failed to get price for contract ${contract._id}`);
      }
    } catch (error) {
      logger.error(`Error updating price for contract ${contract._id}:`, error);
    }
  }

async function getNewPrice(contract: IContract): Promise<number | null> {
  switch (contract.market) {
    case 'PredictIt':
      return await predictItService.fetchContractPrice(contract.market);
    case 'Kalshi':
      return await kalshiService.fetchContractPrice(contract.market);
    case 'Polymarket':
      return await polymarketService.fetchContractPrice(contract.market);
    case 'Manifold':
      return await manifoldService.fetchContractPrice(contract.market);
    default:
      logger.warn(`Unknown market: ${contract.market}`);
      return null;
  }
}

function calculatePriceChange(contract: IContract, newPrice: number): number {
  const oldPrice = contract.priceHistory[contract.priceHistory.length - 1]?.price;
  return oldPrice ? newPrice - oldPrice : 0;
}