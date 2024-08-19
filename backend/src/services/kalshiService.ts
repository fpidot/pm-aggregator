// src/services/kalshiService.ts

import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { IContract } from '../models/Contract';

const KALSHI_API_URL = 'https://trading-api.kalshi.com/trade-api/v2';

const kalshiAxios = axios.create({
  baseURL: KALSHI_API_URL,
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

export const loginToKalshi = async (email: string, password: string): Promise<string> => {
  try {
    const response = await kalshiAxios.post('/login', { email, password });
    return response.data.token;
  } catch (error) {
    console.error('Error logging in to Kalshi:', error);
    throw error;
  }
};

export const discoverKalshiContracts = async (token: string): Promise<IContract[]> => {
  try {
    const response = await kalshiAxios.get('/markets', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.markets.map((market: any) => ({
      platform: 'Kalshi',
      contractId: market.id,
      title: market.title,
      description: market.subtitle,
      currentPrice: market.yes_bid, // Assuming we're using the 'yes' price
      isDisplayed: false,
      isFollowed: false,
    }));
  } catch (error) {
    console.error('Error fetching Kalshi contracts:', error);
    return [];
  }
};

export const updateKalshiPrices = async (token: string, contractIds: string[]): Promise<Partial<IContract>[]> => {
  try {
    const promises = contractIds.map(async (id) => {
      const response = await kalshiAxios.get(`/markets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return {
        platform: 'Kalshi',
        market: 'Kalshi',
        contractId: response.data.ticker,
        externalId: response.data.ticker,
        currentPrice: response.data.yes_bid,
        title: response.data.title || '',
        lastUpdated: new Date(),
      };
    });
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error updating Kalshi prices:', error);
    return [];
  }
};

export const getMarketPrice = async (token: string, marketId: string): Promise<number | null> => {
  try {
    const response = await kalshiAxios.get(`/markets/${marketId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.yes_bid;
  } catch (error) {
    console.error('Error fetching price from Kalshi:', error);
    return null;
  }
};