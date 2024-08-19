import { GenericContract } from '../types/genericContract';
import { loginToKalshi, discoverKalshiContracts, KalshiContract } from './kalshiService';
import { discoverPredictItContracts } from './predictItService';
import { discoverPolymarketContracts } from './polymarketService';
import { discoverManifoldContracts } from './manifoldService';
import Contract from '../models/Contract';

export async function discoverAllContracts(): Promise<GenericContract[]> {
  try {
    const kalshiToken = await loginToKalshi();

    const [kalshiContracts, predictItContracts, polymarketContracts, manifoldContracts] = await Promise.all([
      discoverKalshiContracts(kalshiToken),
      discoverPredictItContracts(),
      discoverPolymarketContracts(),
      discoverManifoldContracts()
    ]);

    console.log('Sample Kalshi contract:', JSON.stringify(kalshiContracts[0], null, 2));
    console.log('Sample PredictIt contract:', JSON.stringify(predictItContracts[0], null, 2));
    console.log('Sample Polymarket contract:', JSON.stringify(polymarketContracts[0], null, 2));
    console.log('Sample Manifold contract:', JSON.stringify(manifoldContracts[0], null, 2));

    const allContracts: GenericContract[] = [
      ...kalshiContracts.map((c: KalshiContract) => ({
        externalId: c.ticker,
        market: 'Kalshi',
        title: c.title,
        currentPrice: c.yes_bid / 100, // Converting cents to dollars
        lastUpdated: new Date(),
        category: c.category || 'Uncategorized'
      } as GenericContract)),
      ...predictItContracts.map(c => ({
        externalId: c.id.toString(),
        market: 'PredictIt',
        title: c.name,
        currentPrice: c.lastTradePrice,
        lastUpdated: new Date(),
        category: c.markets || 'Uncategorized'
      } as GenericContract)),
      ...polymarketContracts.map(c => ({
        externalId: c.id,
        market: 'Polymarket',
        title: c.question,
        currentPrice: c.outcomePrices[0],
        lastUpdated: new Date(),
        category: 'Uncategorized'
      } as GenericContract)),
      ...manifoldContracts.map(c => ({
        externalId: c.id,
        market: 'Manifold',
        title: c.question,
        currentPrice: c.probability,
        lastUpdated: new Date(),
        category: 'Uncategorized'
      } as GenericContract))
    ];

    console.log(`Discovered ${allContracts.length} contracts in total`);
    console.log(`Kalshi: ${kalshiContracts.length}`);
    console.log(`PredictIt: ${predictItContracts.length}`);
    console.log(`Polymarket: ${polymarketContracts.length}`);
    console.log(`Manifold: ${manifoldContracts.length}`);

    // Store or update the discovered contracts in the database
    for (const contract of allContracts) {
      await Contract.findOneAndUpdate(
        { externalId: contract.externalId, market: contract.market },
        {
          $set: {
            title: contract.title,
            currentPrice: contract.currentPrice,
            lastUpdated: contract.lastUpdated,
            category: contract.category
          }
        },
        { upsert: true, new: true }
      );
    }

    return allContracts;
  } catch (error) {
    console.error('Error discovering contracts:', error);
    return [];
  }
}