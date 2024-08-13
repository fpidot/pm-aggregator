import axios from 'axios';

interface ManifoldContract {
  id: string;
  question: string;
  probability: number;
}

const MANIFOLD_API_URL = 'https://manifold.markets/api/v0';

export async function discoverManifoldContracts(): Promise<ManifoldContract[]> {
  try {
    const response = await axios.get(`${MANIFOLD_API_URL}/markets`);
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
      contractIds.map(id => axios.get(`${MANIFOLD_API_URL}/market/${id}`))
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
      const response = await axios.get(`${MANIFOLD_API_URL}/market/${externalId}`);
      if (response.data && response.data.probability) {
        return response.data.probability;
      }
      return null;
    } catch (error) {
      console.error('Error fetching price from Manifold:', error);
      return null;
    }
  };