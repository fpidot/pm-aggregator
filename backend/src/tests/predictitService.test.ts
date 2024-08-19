// src/tests/predictItService.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverPredictItContracts, updatePredictItPrices, fetchContractPrice } from '../services/predictItService';

const mock = new MockAdapter(axios);

describe('PredictIt Service', () => {
  afterEach(() => {
    mock.reset();
  });

  const mockApiResponse = {
    markets: [
      {
        id: 1,
        name: 'Test Market',
        contracts: [
          { id: 101, name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5 },
          { id: 102, name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7 },
        ],
      },
    ],
  };

  describe('discoverPredictItContracts', () => {
    it('should discover PredictIt contracts', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(200, mockApiResponse);

      const result = await discoverPredictItContracts();
      expect(result).toEqual([
        { id: 101, name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5, markets: 'Test Market' },
        { id: 102, name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7, markets: 'Test Market' },
      ]);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(500);

      const result = await discoverPredictItContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updatePredictItPrices', () => {
    it('should update PredictIt prices', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(200, mockApiResponse);

      const result = await updatePredictItPrices(['101', '102']);
      expect(result).toEqual([
        { externalId: '101', market: 'PredictIt', title: 'Contract 1', currentPrice: 0.5, lastUpdated: expect.any(Date), category: 'Test Market' },
        { externalId: '102', market: 'PredictIt', title: 'Contract 2', currentPrice: 0.7, lastUpdated: expect.any(Date), category: 'Test Market' },
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(500);

      const result = await updatePredictItPrices(['101', '102']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(200, mockApiResponse);

      const result = await fetchContractPrice('101');
      expect(result).toEqual(0.5);
    });

    it('should return null if contract is not found', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(200, mockApiResponse);

      const result = await fetchContractPrice('999');
      expect(result).toBeNull();
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all').reply(500);

      const result = await fetchContractPrice('101');
      expect(result).toBeNull();
    });
  });
});