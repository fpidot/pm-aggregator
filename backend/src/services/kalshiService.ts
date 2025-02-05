// src/services/kalshiService.ts

import axios, { AxiosError, AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { IContract } from '../models/Contract';
import { GenericContract } from '../types/genericContract';
import dotenv from 'dotenv';
import path from 'path';

export interface KalshiContract {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  status: string;
  category: string;
}

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const KALSHI_REST_API_URL = 'https://trading-api.kalshi.com/trade-api/v2';

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

export async function discoverKalshiContracts(token: string): Promise<KalshiContract[]> {
  try {
    console.log('Fetching Kalshi contracts...');
    const response = await kalshiAxios.get('/markets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    console.log('Kalshi API response:', JSON.stringify(response.data, null, 2));

    if (response.data && Array.isArray(response.data.markets)) {
      return response.data.markets.map((market: any): KalshiContract => ({
        ticker: market.ticker,
        event_ticker: market.event_ticker,
        market_type: market.market_type,
        title: market.title,
        subtitle: market.subtitle,
        yes_bid: market.yes_bid,
        yes_ask: market.yes_ask,
        no_bid: market.no_bid,
        no_ask: market.no_ask,
        last_price: market.last_price,
        status: market.status,
        category: market.category || 'Uncategorized',
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
}

export const getMarketPrice = async (token: string, marketId: string | undefined): Promise<number | null> => {
  if (!marketId) {
    console.error('Market ID is undefined');
    return null;
  }

  try {
    const response = await kalshiAxios.get(`/markets/${marketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Kalshi API response:', JSON.stringify(response.data, null, 2));
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

export const getMarketData = async (token: string, marketId: string): Promise<any | null> => {
  try {
    const response = await kalshiAxios.get(`/markets/${marketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Kalshi API response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching data for market ${marketId} from Kalshi:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
};

export const updateKalshiPrices = async (token: string, marketIds: string[]): Promise<GenericContract[]> => {
  const updatedPrices: GenericContract[] = [];
  for (const marketId of marketIds) {
    const marketData = await getMarketData(token, marketId);
    if (marketData && typeof marketData.yes_bid === 'number') {
      updatedPrices.push({
        externalId: marketId,
        market: 'Kalshi',
        title: marketData.title || 'Unknown Title',
        currentPrice: marketData.yes_bid / 100, // Convert cents to dollars
        lastUpdated: new Date(),
        category: marketData.category || 'Uncategorized'
      });
    } else {
      console.warn(`Warning: Unable to get valid data for market ${marketId}`);
    }
  }
  return updatedPrices;
};

export const fetchContractPrice = async (token: string, contractId: string): Promise<number | null> => {
  return getMarketPrice(token, contractId);
};