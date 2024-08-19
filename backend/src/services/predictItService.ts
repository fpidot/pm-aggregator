import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { GenericContract } from '../types/genericContract';

interface PredictItContract {
  id: string;
  name: string;
  shortName: string;
  status: string;
  lastTradePrice: number;
  markets: string;
}

const PREDICTIT_API = 'https://www.predictit.org/api/marketdata/markets';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://www.predictit.org/api/marketdata',
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
    console.error(`PredictIt API Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return Promise.reject(error);
  }
);

export async function updatePredictItPrices(contractIds: string[]): Promise<GenericContract[]> {
  try {
    const response = await axiosInstance.get('/all/');
    const markets = response.data.markets;
    
    const updatedContracts: GenericContract[] = [];
    markets.forEach((market: any) => {
      market.contracts.forEach((contract: any) => {
        if (contractIds.includes(contract.id)) {
          updatedContracts.push({
            externalId: contract.id,
            market: 'PredictIt',
            title: contract.name,
            currentPrice: contract.lastTradePrice,
            lastUpdated: new Date(),
            category: market.name || 'Uncategorized',
          });
        }
      });
    });

    return updatedContracts;
  } catch (error) {
    console.error('Error updating PredictIt prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  try {
    const response = await axiosInstance.get('/all/');
    const markets = response.data.markets;
    for (const market of markets) {
      for (const contract of market.contracts) {
        if (contract.id === contractId) {
          return contract.lastTradePrice;
        }
      }
    }
    console.error('Contract not found:', contractId);
    return null;
  } catch (error) {
    console.error('Error fetching PredictIt contract price:', error);
    return null;
  }
}

export async function discoverPredictItContracts(): Promise<PredictItContract[]> {
  try {
    const response = await axiosInstance.get('/all/');
    const markets = response.data.markets;
    
    const contracts: PredictItContract[] = [];
    markets.forEach((market: any) => {
      market.contracts.forEach((contract: any) => {
        contracts.push({
          id: contract.id,
          name: contract.name,
          shortName: contract.shortName,
          status: contract.status,
          lastTradePrice: contract.lastTradePrice,
          markets: market.name
        });
      });
    });

    return contracts;
  } catch (error) {
    console.error('Error fetching PredictIt contracts:', error);
    return [];
  }
}

