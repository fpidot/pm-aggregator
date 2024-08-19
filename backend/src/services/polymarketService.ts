// src/services/polymarketService.ts

import axios from 'axios';
import { ethers } from 'ethers';
import { GenericContract } from '../types/genericContract';
import dotenv from 'dotenv';

dotenv.config();

const POLYMARKET_API_URL = 'https://clob.polymarket.com';

const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;

if (!POLYGON_PRIVATE_KEY) {
  throw new Error('POLYGON_PRIVATE_KEY not found in environment variables');
}

const wallet = new ethers.Wallet(POLYGON_PRIVATE_KEY);

async function getAuthHeaders(): Promise<Record<string, string>> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = 0; // You might want to implement a nonce management system

  const domain = {
    name: "ClobAuthDomain",
    version: "1",
    chainId: 137, // Polygon chain ID
  };

  const types = {
    ClobAuth: [
      { name: "address", type: "address" },
      { name: "timestamp", type: "string" },
      { name: "nonce", type: "uint256" },
      { name: "message", type: "string" },
    ],
  };

  const value = {
    address: await wallet.getAddress(),
    timestamp: timestamp,
    nonce: nonce,
    message: "This message attests that I control the given wallet",
  };

  const signature = await wallet.signTypedData(domain, types, value);

  return {
    'POLY_ADDRESS': await wallet.getAddress(),
    'POLY_SIGNATURE': signature,
    'POLY_TIMESTAMP': timestamp,
    'POLY_NONCE': nonce.toString(),
  };
}

export async function discoverPolymarketContracts(): Promise<any[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${POLYMARKET_API_URL}/markets`, { headers });
    
    console.log('Polymarket API response:', JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.data) {
      console.error('Unexpected Polymarket API response structure');
      return [];
    }

    const markets = response.data.data;
    if (!Array.isArray(markets)) {
      console.error('Markets data is not an array:', markets);
      return [];
    }

    console.log(`Fetched ${markets.length} markets from Polymarket API`);

    return markets.map((market: any) => ({
      id: market.condition_id || market.id,
      question: market.question,
      outcomePrices: [
        parseFloat(market.yes_price || '0') / 100,
        parseFloat(market.no_price || '0') / 100
      ],
      volume: parseFloat(market.volume || '0')
    }));
  } catch (error) {
    console.error('Error fetching Polymarket contracts:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    return [];
  }
}

export async function updatePolymarketPrices(contractIds: string[]): Promise<GenericContract[]> {
  try {
    const markets = await discoverPolymarketContracts();
    return markets
      .filter(market => contractIds.includes(market.id))
      .map(market => ({
        externalId: market.id,
        market: 'Polymarket',
        title: market.question,
        currentPrice: market.outcomePrices[0],
        lastUpdated: new Date(),
        category: 'Uncategorized',
      }));
  } catch (error) {
    console.error('Error updating Polymarket prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  try {
    const markets = await discoverPolymarketContracts();
    const market = markets.find(m => m.id === contractId);
    return market ? market.outcomePrices[0] : null;
  } catch (error) {
    console.error('Error fetching Polymarket contract price:', error);
    return null;
  }
}