import axios, { AxiosInstance } from 'axios';

interface KalshiContract {
  ticker: string;
  title: string;
  last_price: number;
  market_slug: string;
  category: string;
}

const KALSHI_API_URL = 'https://trading-api.kalshi.com/trade-api/v2';

let axiosInstance: AxiosInstance;

const initializeAxiosInstance = () => {
  axiosInstance = axios.create({
    baseURL: KALSHI_API_URL,
    headers: {
      'Authorization': `Bearer ${process.env.KALSHI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};

let authToken: string | null = null;

async function getAuthToken() {
  if (authToken) return authToken;

  try {
    const response = await axios.post(`${KALSHI_API_URL}/login`, {
      email: process.env.KALSHI_EMAIL,
      password: process.env.KALSHI_PASSWORD,
    });
    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error('Error authenticating with Kalshi:', error);
    throw error;
  }
}

export async function discoverKalshiContracts(): Promise<KalshiContract[]> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${KALSHI_API_URL}/markets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.markets.flatMap((market: any) => 
      market.contracts.map((contract: any) => ({
        ticker: contract.ticker,
        title: contract.title,
        last_price: contract.last_price,
        market_slug: market.ticker,
        category: market.category,
      }))
    );
  } catch (error) {
    console.error('Error fetching Kalshi contracts:', error);
    return [];
  }
}

export async function updateKalshiPrices(tickers: string[]): Promise<KalshiContract[]> {
  try {
    const token = await getAuthToken();
    const contracts = await Promise.all(
      tickers.map(ticker => 
        axios.get(`${KALSHI_API_URL}/contracts/${ticker}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );
    return contracts.map(response => ({
      ticker: response.data.ticker,
      title: response.data.title,
      last_price: response.data.last_price,
      market_slug: response.data.market_ticker,
      category: response.data.category,
    }));
  } catch (error) {
    console.error('Error updating Kalshi prices:', error);
    return [];
  }
}

export const getMarketPrice = async (externalId: string): Promise<number | null> => {
    if (!axiosInstance) initializeAxiosInstance();
    try {
      const response = await axiosInstance.get(`/markets/${externalId}`);
      if (response.data && response.data.yes_bid) {
        return response.data.yes_bid / 100; // Kalshi prices are in cents
      }
      return null;
    } catch (error) {
      console.error('Error fetching price from Kalshi:', error);
      return null;
    }
  };

  export const fetchContractPrice = async (externalId: string): Promise<number | null> => {
    if (!axiosInstance) initializeAxiosInstance();
    try {
      const response = await axiosInstance.get(`/markets/${externalId}`);
      if (response.data && response.data.yes_bid) {
        return response.data.yes_bid / 100; // Kalshi prices are in cents
      }
      return null;
    } catch (error) {
      console.error('Error fetching price from Kalshi:', error);
      return null;
    }
  };