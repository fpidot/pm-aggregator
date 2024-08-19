import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import WebSocket from 'ws';
import { IContract } from '../models/Contract';
import { GenericContract } from '../types/genericContract';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KALSHI_REST_API_URL = 'https://trading-api.kalshi.com/trade-api/v2';
const KALSHI_WS_API_URL = 'wss://trading-api.kalshi.com/trade-api/ws/v2';

export const kalshiAxios: AxiosInstance = axios.create({
  baseURL: KALSHI_REST_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRetry(kalshiAxios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

kalshiAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error(`Kalshi API Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return Promise.reject(error);
  }
);

let wsConnection: WebSocket | null = null;

export const loginToKalshi = async (): Promise<string> => {
  try {
    const email = process.env.KALSHI_EMAIL;
    const password = process.env.KALSHI_PASSWORD;

    if (!email || !password) {
      throw new Error('Kalshi credentials not found in environment variables');
    }

    console.log(`Attempting to login with email: ${email}`);

    const response = await kalshiAxios.post('/login', { email, password });
    if (response.data && response.data.token) {
      console.log('Login successful');
      return response.data.token;
    } else {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid response structure');
    }
  } catch (error: any) {
    console.error('Error logging in to Kalshi:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const connectWebSocket = (token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (wsConnection) {
      wsConnection.close();
    }

    console.log('Attempting to connect to WebSocket');
    wsConnection = new WebSocket(KALSHI_WS_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    wsConnection.on('open', () => {
      console.log('WebSocket connection established');
      resolve();
    });

    wsConnection.on('error', (error) => {
      console.error('WebSocket error:', error);
      reject(error);
    });

    wsConnection.on('close', (code, reason) => {
      console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
    });
  });
};

export const discoverKalshiContracts = async (token: string): Promise<Partial<IContract>[]> => {
  try {
    console.log('Fetching Kalshi contracts...');
    const response = await kalshiAxios.get('/markets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('Kalshi API response:', JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data.markets)) {
      return response.data.markets
        .filter((market: any) => market.ticker !== undefined)
        .map((market: any): Partial<IContract> => ({
          platform: 'Kalshi',
          externalId: market.ticker,
          title: market.title,
          description: market.subtitle || '',
          currentPrice: market.yes_bid,
          isDisplayed: false,
          isFollowed: false,
          market: 'Kalshi',
          category: market.category || 'Uncategorized',
          priceHistory: [],
          lastUpdated: new Date(),
        }));
    } else {
      console.error('Unexpected response structure:', JSON.stringify(response.data, null, 2));
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching Kalshi contracts:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return [];
  }
};

export const subscribeToMarketUpdates = (marketIds: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      reject(new Error('WebSocket is not open'));
      return;
    }

    wsConnection.send(JSON.stringify({
      action: 'subscribe',
      target_types: ['market_updates'],
      targets: marketIds,
    }));

    resolve();
  });
};

export const updateKalshiPrices = (marketUpdates: any[]): GenericContract[] => {
  return marketUpdates.map(update => ({
    externalId: update.ticker,
    market: 'Kalshi',
    title: update.title || '',
    currentPrice: update.yes_bid,
    lastUpdated: new Date(),
    category: 'Uncategorized',
  }));
};

export const getMarketPrice = async (token: string, marketId: string | undefined): Promise<number | null> => {
  if (!marketId) {
    console.error('Market ID is undefined');
    return null;
  }

  try {
    // Change from /market/ to /markets/
    const response = await kalshiAxios.get(`/markets/${marketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data && typeof response.data.yes_bid === 'number') {
      return response.data.yes_bid;
    } else {
      console.error('Unexpected response structure:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error(`Error fetching price for market ${marketId} from Kalshi:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

export const fetchContractPrice = async (token: string, contractId: string): Promise<number | null> => {
  return getMarketPrice(token, contractId);
};