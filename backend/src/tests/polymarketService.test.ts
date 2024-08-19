import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverPolymarketContracts, updatePolymarketPrices, fetchContractPrice } from '../services/polymarketService';
import { Wallet } from 'ethers';

jest.mock('ethers', () => ({
  Wallet: jest.fn().mockImplementation(() => ({
    signMessage: jest.fn().mockResolvedValue('mockedSignature'),
  })),
  JsonRpcProvider: jest.fn(),
}));

const mock = new MockAdapter(axios);

describe('Polymarket Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('discoverPolymarketContracts', () => {
    it('should discover Polymarket contracts', async () => {
      const mockContracts = [
        { id: '1', question: 'Question 1', outcomePrices: [0.5, 0.5] },
        { id: '2', question: 'Question 2', outcomePrices: [0.7, 0.3] },
      ];
      mock.onPost('https://subgraph.poly.market/subgraphs/name/polymarket/matic-markets').reply(200, { data: { markets: mockContracts } });

      const result = await discoverPolymarketContracts();
      expect(result).toEqual(mockContracts);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onPost('https://subgraph.poly.market/subgraphs/name/polymarket/matic-markets').reply(500);

      const result = await discoverPolymarketContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updatePolymarketPrices', () => {
    it('should update Polymarket prices', async () => {
      mock.onPost('https://clob.polymarket.com/auth/token').reply(200, { token: 'mockToken' });
      const mockContracts = [
        { id: '1', question: 'Question 1', outcomesPrices: [0.5, 0.5] },
        { id: '2', question: 'Question 2', outcomesPrices: [0.7, 0.3] },
      ];
      mock.onGet('https://clob.polymarket.com/markets/1').reply(200, mockContracts[0]);
      mock.onGet('https://clob.polymarket.com/markets/2').reply(200, mockContracts[1]);

      const result = await updatePolymarketPrices(['1', '2']);
      expect(result).toEqual([
        { id: '1', question: 'Question 1', outcomePrices: [0.5, 0.5] },
        { id: '2', question: 'Question 2', outcomePrices: [0.7, 0.3] },
      ]);
    });

    it('should handle errors when updating prices', async () => {
      mock.onPost('https://clob.polymarket.com/auth/token').reply(200, { token: 'mockToken' });
      mock.onGet('https://clob.polymarket.com/markets/1').reply(500);

      const result = await updatePolymarketPrices(['1']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onGet('https://clob.polymarket.com/markets/1').reply(200, { outcomesPrices: [0.5, 0.5] });

      const result = await fetchContractPrice('1');
      expect(result).toEqual(0.5);
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet('https://clob.polymarket.com/markets/1').reply(500);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });
  });
});