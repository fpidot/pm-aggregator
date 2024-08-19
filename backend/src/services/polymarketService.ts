import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { GenericContract } from '../types/genericContract';


dotenv.config();

const POLYMARKET_API_URL = 'https://clob.polymarket.com';
const POLYMARKET_GRAPH_URL = 'https://subgraph.poly.market/subgraphs/name/polymarket/matic-markets';
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;

interface PolymarketContract {
  id: string;
  question: string;
  outcomePrices: number[];
}

const axiosInstance: AxiosInstance = axios.create();

// Implement retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error: AxiosError) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 429;
  },
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error(`Polymarket API Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return Promise.reject(error);
  }
);

let wallet: ethers.Wallet | null = null;

try {
  if (!POLYGON_PRIVATE_KEY) {
    throw new Error('POLYGON_PRIVATE_KEY is not set in the environment variables');
  }
  wallet = new ethers.Wallet(POLYGON_PRIVATE_KEY);
} catch (error) {
  console.error('Error initializing Polymarket wallet:', error);
}

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const signer = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY as string, provider);

async function getAuthToken() {
  const message = 'Polymarket Authentication';
  const signature = await signer.signMessage(message);
  
  try {
    const response = await axiosInstance.post(`${POLYMARKET_API_URL}/auth/token`, { signature });
    return response.data.token;
  } catch (error) {
    console.error('Error getting Polymarket auth token:', error);
    throw error;
  }
}

export async function discoverPolymarketContracts(): Promise<PolymarketContract[]> {
  const query = `
    {
      markets(first: 1000, orderBy: creationTime, orderDirection: desc) {
        id
        question
        outcomes
        outcomePrices
      }
    }
  `;

  try {
    const response = await axiosInstance.post(POLYMARKET_GRAPH_URL, { query });
    return response.data.data.markets;
  } catch (error) {
    console.error('Error fetching Polymarket contracts:', error);
    return [];
  }
}

export async function updatePolymarketPrices(contractIds: string[]): Promise<GenericContract[]> {
  const token = await getAuthToken();

  try {
    const prices = await Promise.all(contractIds.map(async (id) => {
      const response = await axiosInstance.get(`${POLYMARKET_API_URL}/markets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        externalId: response.data.id,
        market: 'Polymarket',
        title: response.data.question,
        currentPrice: response.data.outcomesPrices[0], // Assuming we're using the first outcome price
        lastUpdated: new Date(),
        category: response.data.category || 'Uncategorized',
      };
    }));

    return prices;
  } catch (error) {
    console.error('Error updating Polymarket prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  const token = await getAuthToken();
  try {
    const response = await axiosInstance.get(`${POLYMARKET_API_URL}/markets/${contractId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.outcomesPrices[0]; // Assuming we're using the first outcome price
  } catch (error) {
    console.error('Error fetching Polymarket contract price:', error);
    return null;
  }
}