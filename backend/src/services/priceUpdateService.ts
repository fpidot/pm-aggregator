import { IContract } from '../models/Contract';
import { GenericContract } from '../types/genericContract';
import * as kalshiService from './kalshiService';
import * as manifoldService from './manifoldService';
import * as polymarketService from './polymarketService';
import * as predictItService from './predictItService';
import Contract from '../models/Contract';

export const updateContractPrices = async (contracts: GenericContract[]): Promise<void> => {
  const kalshiToken = await kalshiService.loginToKalshi(process.env.KALSHI_EMAIL!, process.env.KALSHI_PASSWORD!);
  
  for (const contract of contracts) {
    try {
      let newPrice: number | null = null;

      switch (contract.market) {
        case 'Kalshi':
          newPrice = await kalshiService.fetchContractPrice(kalshiToken, contract.externalId);
          break;
        case 'Manifold':
          newPrice = await manifoldService.fetchContractPrice(contract.externalId);
          break;
        case 'Polymarket':
          newPrice = await polymarketService.fetchContractPrice(contract.externalId);
          break;
        case 'PredictIt':
          newPrice = await predictItService.fetchContractPrice(contract.externalId);
          break;
      }

      if (newPrice !== null) {
        await Contract.findOneAndUpdate(
          { externalId: contract.externalId, market: contract.market },
          { 
            $set: { currentPrice: newPrice, lastUpdated: new Date() },
            $push: { priceHistory: { price: newPrice, timestamp: new Date() } }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    } catch (error) {
      console.error(`Error updating price for contract ${contract.externalId}:`, error);
    }
  }
};

export { updateContractPrices as updatePrices };