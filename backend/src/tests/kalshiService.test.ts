import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import WebSocket from 'ws';
import {
  loginToKalshi,
  discoverKalshiContracts,
  updateKalshiPrices,
  getMarketPrice,
  connectWebSocket,
  subscribeToMarketUpdates,
  kalshiAxios,
} from '../services/kalshiService';

jest.mock('ws');

const mock = new MockAdapter(kalshiAxios);

describe('Kalshi Service', () => {
  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    mock.onPost('/login').reply(200, {
      token: 'mock_token',
    });
  
    const token = await loginToKalshi();
    expect(token).toBe('mock_token');
  });

  it('should discover Kalshi contracts', async () => {
    mock.onGet('/markets').reply(200, {
      markets: [
        {
          ticker: 'ABC',
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

  it('should get market price', async () => {
    mock.onGet('/markets/ABC').reply(200, {
      yes_bid: 0.7,
    });

    const price = await getMarketPrice('mock_token', 'ABC');
    expect(price).toBe(0.7);
  });

  it('should handle errors when discovering contracts', async () => {
    mock.onGet('/markets').reply(500);

    const contracts = await discoverKalshiContracts('mock_token');
    expect(contracts).toEqual([]);
  });

  it('should handle errors when getting market price', async () => {
    mock.onGet('/markets/ABC').reply(500);

    const price = await getMarketPrice('mock_token', 'ABC');
    expect(price).toBeNull();
  });

  it('should connect to WebSocket', () => {
    connectWebSocket('mock_token');
    expect(WebSocket).toHaveBeenCalledWith('wss://trading-api.kalshi.com/trade-api/ws/v2');
  });

  it('should subscribe to market updates', () => {
    const mockSend = jest.fn();
    (WebSocket as jest.MockedClass<typeof WebSocket>).mockImplementation(() => ({
      on: jest.fn(),
      send: mockSend,
    } as unknown as WebSocket));

    connectWebSocket('mock_token');
    subscribeToMarketUpdates(['ABC', 'DEF']);

    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({
      action: 'subscribe',
      target_types: ['market_updates'],
      targets: ['ABC', 'DEF'],
    }));
  });

  it('should update prices from WebSocket data', () => {
    const marketUpdates = [
      { ticker: 'ABC', yes_bid: 0.6, title: 'Test Market 1' },
      { ticker: 'DEF', yes_bid: 0.7, title: 'Test Market 2' },
    ];

    const updatedContracts = updateKalshiPrices(marketUpdates);
    expect(updatedContracts).toHaveLength(2);
    expect(updatedContracts[0]).toEqual({
      externalId: 'ABC',
      market: 'Kalshi',
      title: 'Test Market 1',
      currentPrice: 0.6,
      lastUpdated: expect.any(Date),
      category: 'Uncategorized',
    });
  });
});