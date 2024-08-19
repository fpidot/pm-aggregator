// src/tests/manifoldService.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverManifoldContracts, updateManifoldPrices, fetchContractPrice } from '../services/manifoldService';

const mock = new MockAdapter(axios);

describe('Manifold Service', () => {
  afterEach(() => {
    mock.reset();
  });

  const mockMarkets = [
    { id: '1', question: 'Will event A happen?', probability: 0.7, volume: 1000 },
    { id: '2', question: 'Will event B occur?', probability: 0.3, volume: 500 }
  ];

  describe('discoverManifoldContracts', () => {
    it('should discover Manifold contracts', async () => {
      mock.onGet('https://manifold.markets/api/v0/markets').reply(200, mockMarkets);

      const result = await discoverManifoldContracts();
      expect(result).toEqual(mockMarkets);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onGet('https://manifold.markets/api/v0/markets').reply(500);

      const result = await discoverManifoldContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updateManifoldPrices', () => {
    it('should update Manifold prices', async () => {
      mock.onGet('https://manifold.markets/api/v0/markets').reply(200, mockMarkets);

      const result = await updateManifoldPrices(['1', '2']);
      expect(result).toEqual([
        { externalId: '1', market: 'Manifold', title: 'Will event A happen?', currentPrice: 0.7, lastUpdated: expect.any(Date), category: 'Uncategorized' },
        { externalId: '2', market: 'Manifold', title: 'Will event B occur?', currentPrice: 0.3, lastUpdated: expect.any(Date), category: 'Uncategorized' }
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onGet('https://manifold.markets/api/v0/markets').reply(500);

      const result = await updateManifoldPrices(['1', '2']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(200, { probability: 0.7 });

      const result = await fetchContractPrice('1');
      expect(result).toEqual(0.7);
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(500);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });
  });
});