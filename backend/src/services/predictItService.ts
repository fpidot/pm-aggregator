import axios from 'axios';

interface PredictItContract {
  id: string;
  name: string;
  shortName: string;
  status: string;
  lastTradePrice: number;
  markets: string;
}

export async function discoverPredictItContracts(): Promise<PredictItContract[]> {
  try {
    const response = await axios.get('https://www.predictit.org/api/marketdata/all/');
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
    const response = await axios.get('https://www.predictit.org/api/marketdata/all/');
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