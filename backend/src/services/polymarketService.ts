import axios from 'axios';
import { ethers } from 'ethers';

interface PolymarketContract {
  id: string;
  question: string;
  outcomePrices: number[];
}

const POLYMARKET_API_URL = 'https://clob.polymarket.com';
const POLYMARKET_GRAPH_URL = 'https://subgraph.poly.market/subgraphs/name/polymarket/matic-markets';

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const signer = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY as string, provider);

async function getAuthToken() {
  const message = 'Polymarket Authentication';
  const signature = await signer.signMessage(message);
  
  try {
    const response = await axios.post(`${POLYMARKET_API_URL}/auth/token`, { signature });
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
    const response = await axios.post(POLYMARKET_GRAPH_URL, { query });
    return response.data.data.markets;
  } catch (error) {
    console.error('Error fetching Polymarket contracts:', error);
    return [];
  }
}

export async function updatePolymarketPrices(contractIds: string[]): Promise<PolymarketContract[]> {
  const token = await getAuthToken();

  try {
    const prices = await Promise.all(contractIds.map(async (id) => {
      const response = await axios.get(`${POLYMARKET_API_URL}/markets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        id: response.data.id,
        question: response.data.question,
        outcomePrices: response.data.outcomesPrices
      };
    }));

    return prices;
  } catch (error) {
    console.error('Error updating Polymarket prices:', error);
    return [];
  }
}