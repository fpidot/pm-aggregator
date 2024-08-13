import { discoverAllContracts, updateFollowedContractPrices } from '../services/marketDiscoveryService';
import Contract from '../models/Contract';

jest.mock('axios');
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(),
  Wallet: jest.fn().mockImplementation(() => ({
    signMessage: jest.fn().mockResolvedValue('mocked_signature')
  }))
}));

jest.mock('../services/predictItService', () => ({
    discoverPredictItContracts: jest.fn().mockResolvedValue([{ id: 'predict1', name: 'PredictIt Contract' }]),
    updatePredictItPrices: jest.fn().mockResolvedValue([{ id: 'predict1', name: 'PredictIt Contract', price: 0.5 }])
  }));
  
  jest.mock('../services/kalshiService', () => ({
    discoverKalshiContracts: jest.fn().mockResolvedValue([{ ticker: 'kalshi1', title: 'Kalshi Contract' }]),
    updateKalshiPrices: jest.fn().mockResolvedValue([{ ticker: 'kalshi1', title: 'Kalshi Contract', last_price: 0.6 }])
  }));
  
  jest.mock('../services/polymarketService', () => ({
    discoverPolymarketContracts: jest.fn().mockResolvedValue([{ id: 'poly1', question: 'Polymarket Contract' }]),
    updatePolymarketPrices: jest.fn().mockResolvedValue([{ id: 'poly1', question: 'Polymarket Contract', outcomePrices: [0.7, 0.3] }])
  }));
  
  jest.mock('../services/manifoldService', () => ({
    discoverManifoldContracts: jest.fn().mockResolvedValue([{ id: 'manifold1', question: 'Manifold Contract' }]),
    updateManifoldPrices: jest.fn().mockResolvedValue([{ id: 'manifold1', question: 'Manifold Contract', probability: 0.8 }])
  }));

  // Mock Contract model
jest.mock('../models/Contract', () => ({
    findOneAndUpdate: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockResolvedValue([
      { market: 'PredictIt', externalId: 'predict1' },
      { market: 'Kalshi', externalId: 'kalshi1' },
      { market: 'Polymarket', externalId: 'poly1' },
      { market: 'Manifold', externalId: 'manifold1' }
    ])
  }));

describe('Market Discovery Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('discoverAllContracts discovers and saves contracts', async () => {
    await discoverAllContracts();
    expect(Contract.findOneAndUpdate).toHaveBeenCalled();
  });

  test('updateFollowedContractPrices updates prices for followed contracts', async () => {
    await updateFollowedContractPrices();
    expect(Contract.find).toHaveBeenCalledWith({ isFollowed: true });
    expect(Contract.findOneAndUpdate).toHaveBeenCalled();
  });
});