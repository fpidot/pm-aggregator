// src/services/manifoldService.ts

import axios from 'axios';
import { GenericContract } from '../types/genericContract';

const MANIFOLD_API_URL = 'https://manifold.markets/api/v0';

export async function discoverManifoldContracts(): Promise<any[]> {
  try {
    const response = await axios.get(`${MANIFOLD_API_URL}/markets`);
    return response.data.map((market: any) => ({
      id: market.id,
      question: market.question,
      probability: market.probability,
      volume: market.volume
    }));
  } catch (error) {
    console.error('Error fetching Manifold contracts:', error);
    return [];
  }
}

export async function updateManifoldPrices(contractIds: string[]): Promise<GenericContract[]> {
  try {
    const markets = await discoverManifoldContracts();
    return markets
      .filter((market) => contractIds.includes(market.id))
      .map((market) => ({
        externalId: market.id,
        market: 'Manifold',
        title: market.question,
        currentPrice: market.probability,
        lastUpdated: new Date(),
        category: 'Uncategorized',
      }));
  } catch (error) {
    console.error('Error updating Manifold prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  try {
    const response = await axios.get(`${MANIFOLD_API_URL}/market/${contractId}`);
    return response.data.probability;
  } catch (error) {
    console.error('Error fetching Manifold contract price:', error);
    return null;
  }
}