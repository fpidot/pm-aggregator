import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

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

export async function updateManifoldPrices(contractIds: string[]): Promise<ManifoldContract[]> {
  try {
    const contracts = await Promise.all(
      contractIds.map(id => axiosInstance.get(`/market/${id}`))
    );
    return contracts.map(response => ({
      id: response.data.id,
      question: response.data.question,
      probability: response.data.probability,
    }));
  } catch (error) {
    console.error('Error updating Manifold prices:', error);
    return [];
  }
}

export const fetchContractPrice = async (externalId: string): Promise<number | null> => {
  try {
    const response = await axiosInstance.get(`/market/${externalId}`);
    if (response.data && response.data.probability) {
      return response.data.probability;
    }
    return null;
  } catch (error) {
    console.error('Error fetching price from Manifold:', error);
    return null;
  }
};