import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverPredictItContracts, updatePredictItPrices, fetchContractPrice } from '../services/predictItService';

const mock = new MockAdapter(axios);

describe('PredictIt Service', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('discoverPredictItContracts', () => {
    it('should discover PredictIt contracts', async () => {
      const mockMarkets = {
        markets: [
          {
            name: 'Market 1',
            contracts: [
              { id: '1', name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5 },
              { id: '2', name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7 },
            ],
          },
        ],
      };
      mock.onGet('https://www.predictit.org/api/marketdata/all/').reply(200, mockMarkets);

      const result = await discoverPredictItContracts();
      expect(result).toEqual([
        { id: '1', name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5, markets: 'Market 1' },
        { id: '2', name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7, markets: 'Market 1' },
      ]);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all/').reply(500);

      const result = await discoverPredictItContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updatePredictItPrices', () => {
    it('should update PredictIt prices', async () => {
      const mockMarkets = {
        markets: [
          {
            name: 'Market 1',
            contracts: [
              { id: '1', name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5 },
              { id: '2', name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7 },
            ],
          },
        ],
      };
      mock.onGet('https://www.predictit.org/api/marketdata/all/').reply(200, mockMarkets);

      const result = await updatePredictItPrices(['1', '2']);
      expect(result).toEqual([
        { id: '1', name: 'Contract 1', shortName: 'C1', status: 'Open', lastTradePrice: 0.5, markets: 'Market 1' },
        { id: '2', name: 'Contract 2', shortName: 'C2', status: 'Open', lastTradePrice: 0.7, markets: 'Market 1' },
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/all/').reply(500);

      const result = await updatePredictItPrices(['1', '2']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      const mockMarket = {
        contracts: [
          { id: '1', lastTradePrice: 0.5 },
          { id: '2', lastTradePrice: 0.7 },
        ],
      };
      mock.onGet('https://www.predictit.org/api/marketdata/markets/1').reply(200, mockMarket);

      const result = await fetchContractPrice('1');
      expect(result).toEqual(0.5);
    });

    it('should return null if contract is not found', async () => {
      const mockMarket = {
        contracts: [
          { id: '2', lastTradePrice: 0.7 },
        ],
      };
      mock.onGet('https://www.predictit.org/api/marketdata/markets/1').reply(200, mockMarket);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet('https://www.predictit.org/api/marketdata/markets/1').reply(500);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });
  });
});