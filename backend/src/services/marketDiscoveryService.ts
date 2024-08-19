import { GenericContract } from '../types/genericContract';
import { loginToKalshi, updateKalshiPrices, discoverKalshiContracts } from './kalshiService';
import { updatePredictItPrices, discoverPredictItContracts } from './predictItService';
import { updatePolymarketPrices, discoverPolymarketContracts } from './polymarketService';
import { updateManifoldPrices, discoverManifoldContracts } from './manifoldService';
import Contract from '../models/Contract';

export async function updateAllPrices(contracts: GenericContract[]) {
  try {
    const kalshiToken = await loginToKalshi(process.env.KALSHI_EMAIL!, process.env.KALSHI_PASSWORD!);

    const kalshiContracts = contracts.filter(c => c.market === 'Kalshi');
    const predictItContracts = contracts.filter(c => c.market === 'PredictIt');
    const polymarketContracts = contracts.filter(c => c.market === 'Polymarket');
    const manifoldContracts = contracts.filter(c => c.market === 'Manifold');

    const [updatedKalshi, updatedPredictIt, updatedPolymarket, updatedManifold] = await Promise.all([
      updateKalshiPrices(kalshiToken, kalshiContracts.map(c => c.externalId)),
      updatePredictItPrices(predictItContracts.map(c => c.externalId)),
      updatePolymarketPrices(polymarketContracts.map(c => c.externalId)),
      updateManifoldPrices(manifoldContracts.map(c => c.externalId))
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

export async function discoverAllContracts(): Promise<GenericContract[]> {
  try {
    const kalshiToken = await loginToKalshi(process.env.KALSHI_EMAIL!, process.env.KALSHI_PASSWORD!);

    const [kalshiContracts, predictItContracts, polymarketContracts, manifoldContracts] = await Promise.all([
      discoverKalshiContracts(kalshiToken),
      discoverPredictItContracts(),
      discoverPolymarketContracts(),
      discoverManifoldContracts()
    ]);

    const allContracts: GenericContract[] = [
      ...kalshiContracts.map(c => ({ ...c, market: 'Kalshi' })),
      ...predictItContracts.map(c => ({
        externalId: c.id,
        market: 'PredictIt',
        title: c.name,
        currentPrice: c.lastTradePrice,
        lastUpdated: new Date(),
        category: c.markets || 'Uncategorized'
      })),
      ...polymarketContracts.map(c => ({
        externalId: c.id,
        market: 'Polymarket',
        title: c.question,
        currentPrice: c.outcomePrices[0], // Assuming we're using the first outcome price
        lastUpdated: new Date(),
        category: 'Uncategorized'
      })),
      ...manifoldContracts.map(c => ({
        externalId: c.id,
        market: 'Manifold',
        title: c.question,
        currentPrice: c.probability,
        lastUpdated: new Date(),
        category: 'Uncategorized'
      }))
    ];

    return allContracts;
  } catch (error) {
    console.error('Error discovering contracts:', error);
    return [];
  }
}