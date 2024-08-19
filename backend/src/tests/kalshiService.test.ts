import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverKalshiContracts, updateKalshiPrices, getMarketPrice, fetchContractPrice } from '../services/kalshiService';

const mock = new MockAdapter(axios);

describe('Kalshi Service', () => {
  beforeEach(() => {
    process.env.KALSHI_API_URL = 'https://trading-api.kalshi.com/trade-api/v2';
    mock.onPost(`${process.env.KALSHI_API_URL}/login`).reply(200, { token: 'mockToken' });
  });

  afterEach(() => {
    mock.reset();
  });

  describe('discoverKalshiContracts', () => {
    it('should discover Kalshi contracts', async () => {
      const mockMarkets = {
        markets: [
          {
            ticker: 'MARKET1',
            contracts: [
              { ticker: 'ABC', title: 'Contract 1', last_price: 0.5 }
            ],
            category: 'cat1'
          },
          {
            ticker: 'MARKET2',
            contracts: [
              { ticker: 'DEF', title: 'Contract 2', last_price: 0.7 }
            ],
            category: 'cat2'
          }
        ]
      };
      mock.onGet(`${process.env.KALSHI_API_URL}/markets`).reply(200, mockMarkets);

      const result = await discoverKalshiContracts();
      expect(result).toEqual([
        { ticker: 'ABC', title: 'Contract 1', last_price: 0.5, market_slug: 'MARKET1', category: 'cat1' },
        { ticker: 'DEF', title: 'Contract 2', last_price: 0.7, market_slug: 'MARKET2', category: 'cat2' }
      ]);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/markets`).reply(500);

      const result = await discoverKalshiContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updateKalshiPrices', () => {
    it('should update Kalshi prices', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/contracts/ABC`).reply(200, {
        ticker: 'ABC',
        title: 'Contract 1',
        last_price: 0.5,
        market_ticker: 'MARKET1',
        category: 'cat1'
      });
      mock.onGet(`${process.env.KALSHI_API_URL}/contracts/DEF`).reply(200, {
        ticker: 'DEF',
        title: 'Contract 2',
        last_price: 0.7,
        market_ticker: 'MARKET2',
        category: 'cat2'
      });

      const result = await updateKalshiPrices(['ABC', 'DEF']);
      expect(result).toEqual([
        { ticker: 'ABC', title: 'Contract 1', last_price: 0.5, market_slug: 'MARKET1', category: 'cat1' },
        { ticker: 'DEF', title: 'Contract 2', last_price: 0.7, market_slug: 'MARKET2', category: 'cat2' }
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/contracts/ABC`).reply(500);

      const result = await updateKalshiPrices(['ABC']);
      expect(result).toEqual([]);
    });
  });

  describe('getMarketPrice', () => {
    it('should get market price', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/markets/ABC`).reply(200, { yes_bid: 5000 });

      const result = await getMarketPrice('ABC');
      expect(result).toEqual(50); // 5000 cents converted to dollars
    });

    it('should handle errors when getting market price', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/markets/ABC`).reply(500);

      const result = await getMarketPrice('ABC');
      expect(result).toBeNull();
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/markets/ABC`).reply(200, { yes_bid: 5000 });

      const result = await fetchContractPrice('ABC');
      expect(result).toEqual(50); // 5000 cents converted to dollars
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet(`${process.env.KALSHI_API_URL}/markets/ABC`).reply(500);

      const result = await fetchContractPrice('ABC');
      expect(result).toBeNull();
    });
  });
});