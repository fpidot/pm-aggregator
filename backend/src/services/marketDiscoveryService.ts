import { discoverPredictItContracts, updatePredictItPrices } from './predictItService';
import { loginToKalshi, discoverKalshiContracts, updateKalshiPrices } from './kalshiService';
import { discoverPolymarketContracts, updatePolymarketPrices } from './polymarketService';
import { discoverManifoldContracts, updateManifoldPrices } from './manifoldService';
import Contract from '../models/Contract';
import { GenericContract } from '../types/genericContract';

export async function discoverAllContracts() {
  try {
    const kalshiToken = await loginToKalshi(process.env.KALSHI_EMAIL!, process.env.KALSHI_PASSWORD!);

    const [predictItContracts, kalshiContracts, polymarketContracts, manifoldContracts] = await Promise.all([
      discoverPredictItContracts(),
      discoverKalshiContracts(kalshiToken),
      discoverPolymarketContracts(),
      discoverManifoldContracts()
    ]);

    const allContracts: GenericContract[] = [
      ...(predictItContracts || []).map(c => ({ ...c, market: 'PredictIt' })),
      ...(kalshiContracts || []).map(c => ({ ...c, market: 'Kalshi' })),
      ...(polymarketContracts || []).map(c => ({ ...c, market: 'Polymarket' })),
      ...(manifoldContracts || []).map(c => ({ ...c, market: 'Manifold' }))
    ];

    for (const contract of allContracts) {
      await Contract.findOneAndUpdate(
        { externalId: getContractId(contract), market: contract.market },
        {
          title: getContractTitle(contract),
          market: contract.market,
          currentPrice: getContractPrice(contract),
          category: contract.category || 'Uncategorized',
          lastUpdated: new Date(),
          externalId: getContractId(contract)
        },
        { upsert: true, new: true }
      );
    }

    console.log('Contract discovery completed');
  } catch (error) {
    console.error('Error in contract discovery:', error);
  }
}

// Existing helper functions
function getContractId(contract: GenericContract): string {
  return contract.id || contract.ticker || '';
}

function getContractTitle(contract: GenericContract): string {
  return contract.name || contract.question || contract.title || '';
}

function getContractPrice(contract: GenericContract): number {
  return contract.lastTradePrice || contract.last_price || contract.probability || (contract.outcomePrices ? contract.outcomePrices[0] : 0);
}

// New function for updating prices
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

    const updatedContracts = [
      ...updatedKalshi,
      ...updatedPredictIt,
      ...updatedPolymarket,
      ...updatedManifold
    ] as GenericContract[];

    for (const contract of updatedContracts) {
      if (contract.market && contract.externalId) {
        await Contract.findOneAndUpdate(
          { externalId: contract.externalId, market: contract.market },
          {
            $set: {
              currentPrice: contract.currentPrice,
              lastUpdated: new Date(),
            },
            $push: {
              priceHistory: {
                price: contract.currentPrice,
                timestamp: new Date()
              }
            }
          },
          { new: true }
        );
      }
    }

    console.log('Price update completed');
  } catch (error) {
    console.error('Error in price update:', error);
  }
}