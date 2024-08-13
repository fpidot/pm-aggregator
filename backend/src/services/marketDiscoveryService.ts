import { discoverPredictItContracts, updatePredictItPrices } from './predictItService';
import { discoverKalshiContracts, updateKalshiPrices } from './kalshiService';
import { discoverPolymarketContracts, updatePolymarketPrices } from './polymarketService';
import { discoverManifoldContracts, updateManifoldPrices } from './manifoldService';
import Contract from '../models/Contract';

interface GenericContract {
  id?: string;
  ticker?: string;
  name?: string;
  question?: string;
  title?: string;
  shortName?: string;
  status?: string;
  lastTradePrice?: number;
  last_price?: number;
  probability?: number;
  outcomePrices?: number[];
  market: string;
  category?: string;
}

function getContractId(contract: GenericContract): string {
  return contract.id || contract.ticker || '';
}

function getContractTitle(contract: GenericContract): string {
  return contract.name || contract.question || contract.title || '';
}

function getContractPrice(contract: GenericContract): number {
  return contract.lastTradePrice || contract.last_price || contract.probability || (contract.outcomePrices ? contract.outcomePrices[0] : 0);
}

export async function discoverAllContracts() {
  try {
    const [predictItContracts, kalshiContracts, polymarketContracts, manifoldContracts] = await Promise.all([
      discoverPredictItContracts(),
      discoverKalshiContracts(),
      discoverPolymarketContracts(),
      discoverManifoldContracts()
    ]);

    const allContracts: GenericContract[] = [
      ...predictItContracts.map(c => ({ ...c, market: 'PredictIt' })),
      ...kalshiContracts.map(c => ({ ...c, market: 'Kalshi' })),
      ...polymarketContracts.map(c => ({ ...c, market: 'Polymarket' })),
      ...manifoldContracts.map(c => ({ ...c, market: 'Manifold' }))
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

export async function updateFollowedContractPrices() {
  try {
    const followedContracts = await Contract.find({ isFollowed: true });
    const contractsByMarket: { [key: string]: string[] } = {
      PredictIt: [],
      Kalshi: [],
      Polymarket: [],
      Manifold: []
    };

    followedContracts.forEach(contract => {
      if (contract.externalId) {
        contractsByMarket[contract.market].push(contract.externalId);
      }
    });

    const [updatedPredictIt, updatedKalshi, updatedPolymarket, updatedManifold] = await Promise.all([
      updatePredictItPrices(contractsByMarket.PredictIt),
      updateKalshiPrices(contractsByMarket.Kalshi),
      updatePolymarketPrices(contractsByMarket.Polymarket),
      updateManifoldPrices(contractsByMarket.Manifold)
    ]);

    const allUpdatedContracts: GenericContract[] = [
      ...updatedPredictIt.map(c => ({ ...c, market: 'PredictIt' })),
      ...updatedKalshi.map(c => ({ ...c, market: 'Kalshi' })),
      ...updatedPolymarket.map(c => ({ ...c, market: 'Polymarket' })),
      ...updatedManifold.map(c => ({ ...c, market: 'Manifold' }))
    ];

    for (const contract of allUpdatedContracts) {
      await Contract.findOneAndUpdate(
        { externalId: getContractId(contract), market: contract.market },
        {
          currentPrice: getContractPrice(contract),
          lastUpdated: new Date()
        }
      );
    }

    console.log('Followed contract prices updated');
  } catch (error) {
    console.error('Error updating followed contract prices:', error);
  }
}