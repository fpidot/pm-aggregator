import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { discoverManifoldContracts, updateManifoldPrices, fetchContractPrice } from '../services/manifoldService';

const mock = new MockAdapter(axios);

describe('Manifold Service', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('discoverManifoldContracts', () => {
    it('should discover Manifold contracts', async () => {
      const mockContracts = [
        { id: '1', question: 'Question 1', probability: 0.5 },
        { id: '2', question: 'Question 2', probability: 0.7 },
      ];
      mock.onGet('https://manifold.markets/api/v0/markets').reply(200, mockContracts);

      const result = await discoverManifoldContracts();
      expect(result).toEqual(mockContracts);
    });

    it('should handle errors when discovering contracts', async () => {
      mock.onGet('https://manifold.markets/api/v0/markets').reply(500);

      const result = await discoverManifoldContracts();
      expect(result).toEqual([]);
    });
  });

  describe('updateManifoldPrices', () => {
    it('should update Manifold prices', async () => {
      const mockContracts = [
        { id: '1', question: 'Question 1', probability: 0.5 },
        { id: '2', question: 'Question 2', probability: 0.7 },
      ];
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(200, mockContracts[0]);
      mock.onGet('https://manifold.markets/api/v0/market/2').reply(200, mockContracts[1]);

      const result = await updateManifoldPrices(['1', '2']);
      expect(result).toEqual(mockContracts);
    });

    it('should handle errors when updating prices', async () => {
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(500);

      const result = await updateManifoldPrices(['1']);
      expect(result).toEqual([]);
    });
  });

  describe('fetchContractPrice', () => {
    it('should fetch contract price', async () => {
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(200, { probability: 0.5 });

      const result = await fetchContractPrice('1');
      expect(result).toEqual(0.5);
    });

    it('should handle errors when fetching contract price', async () => {
      mock.onGet('https://manifold.markets/api/v0/market/1').reply(500);

      const result = await fetchContractPrice('1');
      expect(result).toBeNull();
    });
  });
});