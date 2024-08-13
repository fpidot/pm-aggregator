import logger from '../utils/logger';
import { IContract, ContractModel } from '../models/Contract';
import { IAdminSettings, AdminSettingsModel } from '../models/AdminSettings';
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

      if (Math.abs(priceChange) >= adminSettings.bigMoveThreshold) {
        logger.info(`Big move detected for contract ${contract._id}: ${priceChange}`);
        await alertService.sendBigMoveAlerts(contract, priceChange);
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
  switch (contract.market.platform) {
    case 'PredictIt':
      return await predictItService.getPrice(contract.market.id);
    case 'Kalshi':
      return await kalshiService.getPrice(contract.market.id);
    case 'Polymarket':
      return await polymarketService.getPrice(contract.market.id);
    case 'Manifold':
      return await manifoldService.getPrice(contract.market.id);
    default:
      logger.warn(`Unknown platform: ${contract.market.platform}`);
      return null;
  }
}

function calculatePriceChange(contract: IContract, newPrice: number): number {
  const oldPrice = contract.priceHistory[contract.priceHistory.length - 1]?.price;
  return oldPrice ? newPrice - oldPrice : 0;
}