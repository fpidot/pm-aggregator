import { GenericContract } from '../types/genericContract';
import * as kalshiService from './kalshiService';
import * as predictItService from './predictItService';
import * as polymarketService from './polymarketService';
import * as manifoldService from './manifoldService';
import Contract from '../models/Contract';

export async function updateAllPrices(contracts: GenericContract[]): Promise<void> {
  try {
    const kalshiToken = await kalshiService.loginToKalshi();

    const kalshiContracts = contracts.filter(c => c.market === 'Kalshi');
    const predictItContracts = contracts.filter(c => c.market === 'PredictIt');
    const polymarketContracts = contracts.filter(c => c.market === 'Polymarket');
    const manifoldContracts = contracts.filter(c => c.market === 'Manifold');

    const [updatedKalshi, updatedPredictIt, updatedPolymarket, updatedManifold] = await Promise.all([
      kalshiService.updateKalshiPrices(kalshiToken, kalshiContracts.map(c => c.externalId)),
      predictItService.updatePredictItPrices(predictItContracts.map(c => c.externalId)),
      polymarketService.updatePolymarketPrices(polymarketContracts.map(c => c.externalId)),
      manifoldService.updateManifoldPrices(manifoldContracts.map(c => c.externalId))
    ]);

    const updatedContracts: GenericContract[] = [
      ...updatedKalshi,
      ...updatedPredictIt,
      ...updatedPolymarket,
      ...updatedManifold
    ];

    for (const contract of updatedContracts) {
      await Contract.findOneAndUpdate(
        { externalId: contract.externalId, market: contract.market },
        {
          $set: {
            currentPrice: contract.currentPrice,
            lastUpdated: contract.lastUpdated,
          },
          $push: {
            priceHistory: {
              price: contract.currentPrice,
              timestamp: contract.lastUpdated
            }
          }
        },
        { new: true }
      );
    }

    console.log('Price update completed');
  } catch (error) {
    console.error('Error in price update:', error);
  }
}

export async function fetchContractPrice(contract: GenericContract): Promise<number | null> {
  try {
    let price: number | null = null;

    switch (contract.market) {
      case 'Kalshi':
        const kalshiToken = await kalshiService.loginToKalshi();
        price = await kalshiService.fetchContractPrice(kalshiToken, contract.externalId);
        break;
      case 'PredictIt':
        price = await predictItService.fetchContractPrice(contract.externalId);
        break;
      case 'Polymarket':
        price = await polymarketService.fetchContractPrice(contract.externalId);
        break;
      case 'Manifold':
        price = await manifoldService.fetchContractPrice(contract.externalId);
        break;
      default:
        console.error(`Unknown market: ${contract.market}`);
        return null;
    }

    if (price !== null) {
      await Contract.findOneAndUpdate(
        { externalId: contract.externalId, market: contract.market },
        { 
          $set: { currentPrice: price, lastUpdated: new Date() },
          $push: { priceHistory: { price, timestamp: new Date() } }
        },
        { new: true }
      );
    }

    return price;
  } catch (error) {
    console.error(`Error fetching price for contract ${contract.externalId}:`, error);
    return null;
  }
}