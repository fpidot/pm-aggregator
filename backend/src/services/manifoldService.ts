import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { GenericContract } from '../types/genericContract';


interface ManifoldContract {
  id: string;
  question: string;
  probability: number;
}

const MANIFOLD_API_URL = 'https://manifold.markets/api/v0';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: MANIFOLD_API_URL,
});

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
    console.error(`Manifold API Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return Promise.reject(error);
  }
);

export async function discoverManifoldContracts(): Promise<ManifoldContract[]> {
  try {
    const response = await axiosInstance.get('/markets');
    return response.data.map((market: any) => ({
      id: market.id,
      question: market.question,
      probability: market.probability,
    }));
  } catch (error) {
    console.error('Error fetching Manifold contracts:', error);
    return [];
  }
}

export async function updateManifoldPrices(contractIds: string[]): Promise<GenericContract[]> {
  try {
    const contracts = await Promise.all(
      contractIds.map(id => axiosInstance.get(`/market/${id}`))
    );
    return contracts.map(response => ({
      externalId: response.data.id,
      market: 'Manifold',
      title: response.data.question,
      currentPrice: response.data.probability,
      lastUpdated: new Date(),
      category: response.data.category || 'Uncategorized',
    }));
  } catch (error) {
    console.error('Error updating Manifold prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  try {
    const response = await axiosInstance.get(`/market/${contractId}`);
    return response.data.probability;
  } catch (error) {
    console.error('Error fetching Manifold contract price:', error);
    return null;
  }
}