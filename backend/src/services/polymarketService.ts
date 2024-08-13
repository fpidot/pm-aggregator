import { ethers } from 'ethers';

interface PolymarketContract {
  id: string;
  question: string;
  outcomePrices: number[];
}

const POLYMARKET_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/polymarket/matic-markets';
const POLYGON_RPC_URL = 'https://polygon-rpc.com';

const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY as string, provider);

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
    const response = await fetch(POLYMARKET_GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data.data.markets;
  } catch (error) {
    console.error('Error fetching Polymarket contracts:', error);
    return [];
  }
}

export async function updatePolymarketPrices(contractIds: string[]): Promise<PolymarketContract[]> {
  const query = `
    query($ids: [ID!]) {
      markets(where: { id_in: $ids }) {
        id
        question
        outcomePrices
      }
    }
  `;

  try {
    const response = await fetch(POLYMARKET_GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query,
        variables: { ids: contractIds }
      }),
    });
    const data = await response.json();
    return data.data.markets;
  } catch (error) {
    console.error('Error updating Polymarket prices:', error);
    return [];
  }
}