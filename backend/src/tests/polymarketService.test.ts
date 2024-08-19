// src/tests/polymarketService.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverPolymarketContracts, updatePolymarketPrices, fetchContractPrice } from '../services/polymarketService';

const mock = new MockAdapter(axios);

describe('Polymarket Service', () => {
  afterEach(() => {
    mock.reset();
  });

  const mockGraphQLResponse = {
    data: {
      markets: [
        {
          id: '1',
          question: 'Will event X happen?',
          outcomes: ['Yes', 'No'],
          outcomePrices: ['600000', '400000'],
          volume: '1000000000'
        },
        {
          id: '2',
          question: 'Will event Y occur?',
          outcomes: ['Yes', 'No'],
          outcomePrices: ['300000', '700000'],
          volume: '500000000'
        }
      ]
    }
  };

  describe('discoverPolymarketContracts', () => {
    it('should discover Polymarket contracts', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(200, mockGraphQLResponse);

      const result = await discoverPolymarketContracts();
      expect(result).toEqual([
        { id: '1', question: 'Will event X happen?', outcomePrices: [0.6, 0.4], volume: 1000 },
        { id: '2', question: 'Will event Y occur?', outcomePrices: [0.3, 0.7], volume: 500 }
      ]);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(500);

      const result = await discoverPolymarketContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updatePolymarketPrices', () => {
    it('should update Polymarket prices', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(200, mockGraphQLResponse);

      const result = await updatePolymarketPrices(['1', '2']);
      expect(result).toEqual([
        { externalId: '1', market: 'Polymarket', title: 'Will event X happen?', currentPrice: 0.6, lastUpdated: expect.any(Date), category: 'Uncategorized' },
        { externalId: '2', market: 'Polymarket', title: 'Will event Y occur?', currentPrice: 0.3, lastUpdated: expect.any(Date), category: 'Uncategorized' }
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(500);

      const result = await updatePolymarketPrices(['1', '2']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(200, mockGraphQLResponse);

      const result = await fetchContractPrice('1');
      expect(result).toEqual(0.6);
    });

    it('should return null if contract is not found', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(200, mockGraphQLResponse);

      const result = await fetchContractPrice('3');
      expect(result).toBeNull();
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onPost('https://api.thegraph.com/subgraphs/name/polymarket/matic-markets').reply(500);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });
  });
});