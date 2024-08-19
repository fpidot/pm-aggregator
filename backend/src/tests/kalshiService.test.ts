// src/tests/kalshiService.test.ts

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  loginToKalshi,
  discoverKalshiContracts,
  updateKalshiPrices,
  getMarketPrice,
} from '../services/kalshiService';

const mock = new MockAdapter(axios);

describe('Kalshi Service', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should login successfully', async () => {
    mock.onPost('https://trading-api.kalshi.com/trade-api/v2/login').reply(200, {
      token: 'mock_token',
    });

    const token = await loginToKalshi('test@example.com', 'password');
    expect(token).toBe('mock_token');
  });

  it('should discover Kalshi contracts', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets').reply(200, {
      markets: [
        {
          id: 'ABC',
          title: 'Test Market',
          subtitle: 'Test Description',
          yes_bid: 0.5,
        },
      ],
    });

    const contracts = await discoverKalshiContracts('mock_token');
    expect(contracts).toHaveLength(1);
    expect(contracts[0]).toEqual({
      platform: 'Kalshi',
      contractId: 'ABC',
      title: 'Test Market',
      description: 'Test Description',
      currentPrice: 0.5,
      isDisplayed: false,
      isFollowed: false,
    });
  });

  it('should update Kalshi prices', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets/ABC').reply(200, {
      ticker: 'ABC',
      yes_bid: 0.6,
    });

    const updatedContracts = await updateKalshiPrices('mock_token', ['ABC']);
    expect(updatedContracts).toHaveLength(1);
    expect(updatedContracts[0]).toEqual({
      platform: 'Kalshi',
      contractId: 'ABC',
      currentPrice: 0.6,
    });
  });

  it('should get market price', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets/ABC').reply(200, {
      yes_bid: 0.7,
    });

    const price = await getMarketPrice('mock_token', 'ABC');
    expect(price).toBe(0.7);
  });

  it('should handle errors when discovering contracts', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets').reply(500);

    const contracts = await discoverKalshiContracts('mock_token');
    expect(contracts).toEqual([]);
  });

  it('should handle errors when updating prices', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets/ABC').reply(500);

    const updatedContracts = await updateKalshiPrices('mock_token', ['ABC']);
    expect(updatedContracts).toEqual([]);
  });

  it('should handle errors when getting market price', async () => {
    mock.onGet('https://trading-api.kalshi.com/trade-api/v2/markets/ABC').reply(500);

    const price = await getMarketPrice('mock_token', 'ABC');
    expect(price).toBeNull();
  });
});