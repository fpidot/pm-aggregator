import {
    loginToKalshi,
    discoverKalshiContracts,
    getMarketData,
    updateKalshiPrices,
    fetchContractPrice,
  } from '../services/kalshiService';
  
  jest.setTimeout(30000);
  
  describe('Kalshi Integration Tests', () => {
    let authToken: string;
  
    beforeAll(async () => {
      try {
        authToken = await loginToKalshi();
        expect(authToken).toBeTruthy();
      } catch (error) {
        console.error('Setup failed:', error);
        throw error;
      }
    });
  
    it('should discover contracts and get market data', async () => {
      try {
        const contracts = await discoverKalshiContracts(authToken);
        console.log(`Discovered ${contracts.length} contracts`);
        expect(contracts.length).toBeGreaterThan(0);
  
        // Only log details for the first 5 contracts
        console.log('First 5 contracts:', JSON.stringify(contracts.slice(0, 5), null, 2));
  
        if (contracts.length > 0) {
          const firstContract = contracts[0];
          if (firstContract && firstContract.externalId) {
            console.log(`Attempting to get market data for ${firstContract.externalId}`);
            
            const marketData = await getMarketData(authToken, firstContract.externalId);
            console.log(`Market data: ${JSON.stringify(marketData, null, 2)}`);
            
            expect(marketData).not.toBeNull();
            expect(marketData.yes_bid).toBeDefined();
            expect(marketData.title).toBeDefined();
            
            // Log a warning if yes_bid is 0
            if (marketData.yes_bid === 0) {
              console.warn(`Warning: yes_bid is 0 for market ${firstContract.externalId}`);
            }
          } else {
            fail('First contract does not have a valid externalId');
          }
        } else {
          fail('No contracts discovered');
        }
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });
  
    it('should update prices for multiple markets', async () => {
      try {
        const contracts = await discoverKalshiContracts(authToken);
        const marketIds = contracts.slice(0, 5).map(c => c.externalId!).filter(id => id !== undefined);
  
        const updatedPrices = await updateKalshiPrices(authToken, marketIds);
        console.log('Updated prices:', JSON.stringify(updatedPrices, null, 2));
  
        expect(updatedPrices.length).toBe(marketIds.length);
        updatedPrices.forEach(price => {
          expect(price.currentPrice).not.toBeNull();
          expect(price.title).toBeDefined();
          expect(price.category).toBeDefined();
          
          // Log a warning if currentPrice is 0
          if (price.currentPrice === 0) {
            console.warn(`Warning: currentPrice is 0 for market ${price.externalId}`);
          }
        });
      } catch (error) {
        console.error('Test failed:', error);
        throw error;
      }
    });
  });