import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';

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

export const fetchContractPrice = async (externalId: string): Promise<number | null> => {
  try {
    const response = await axiosInstance.get(`/markets/${externalId}`);
    const contract = response.data.contracts.find((c: any) => c.id === externalId);
    if (contract) {
      return contract.lastTradePrice;
    }
    return null;
  } catch (error) {
    console.error('Error fetching price from PredictIt:', error);
    return null;
  }
};

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

export async function updatePredictItPrices(contractIds: string[]): Promise<PredictItContract[]> {
  try {
    const response = await axiosInstance.get('/all/');
    const markets = response.data.markets;
    
    const updatedContracts: PredictItContract[] = [];
    markets.forEach((market: any) => {
      market.contracts.forEach((contract: any) => {
        if (contractIds.includes(contract.id)) {
          updatedContracts.push({
            id: contract.id,
            name: contract.name,
            shortName: contract.shortName,
            status: contract.status,
            lastTradePrice: contract.lastTradePrice,
            markets: market.name
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