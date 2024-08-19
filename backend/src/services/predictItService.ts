// src/services/predictItService.ts

import axios from 'axios';
import { GenericContract } from '../types/genericContract';

const PREDICTIT_API_URL = 'https://www.predictit.org/api/marketdata/all';

export async function discoverPredictItContracts(): Promise<any[]> {
  try {
    const response = await axios.get(PREDICTIT_API_URL);
    return response.data.markets.flatMap((market: any) => 
      market.contracts.map((contract: any) => ({
        id: contract.id,
        name: contract.name,
        shortName: contract.shortName,
        status: contract.status,
        lastTradePrice: contract.lastTradePrice,
        markets: market.name
      }))
    );
  } catch (error) {
    console.error('Error fetching PredictIt contracts:', error);
    return [];
  }
}

export async function updatePredictItPrices(contractIds: string[]): Promise<GenericContract[]> {
  try {
    const response = await axios.get(PREDICTIT_API_URL);
    const markets = response.data.markets;
    
    return markets.flatMap((market: any) =>
      market.contracts
        .filter((contract: any) => contractIds.includes(contract.id.toString()))
        .map((contract: any) => ({
          externalId: contract.id.toString(),
          market: 'PredictIt',
          title: contract.name,
          currentPrice: contract.lastTradePrice,
          lastUpdated: new Date(),
          category: market.name || 'Uncategorized',
        }))
    );
  } catch (error) {
    console.error('Error updating PredictIt prices:', error);
    return [];
  }
}

export async function fetchContractPrice(contractId: string): Promise<number | null> {
  try {
    const response = await axios.get(PREDICTIT_API_URL);
    const markets = response.data.markets;
    for (const market of markets) {
      const contract = market.contracts.find((c: any) => c.id.toString() === contractId);
      if (contract) {
        return contract.lastTradePrice;
      }
    }
    console.error('Contract not found:', contractId);
    return null;
  } catch (error) {
    console.error('Error fetching PredictIt contract price:', error);
    return null;
  }
}