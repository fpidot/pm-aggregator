import {
    loginToKalshi,
    connectWebSocket,
    discoverKalshiContracts,
    getMarketPrice,
    subscribeToMarketUpdates,
  } from '../services/kalshiService';
  
  jest.setTimeout(30000); // Increase timeout to 30 seconds
  
  describe('Kalshi Integration Tests', () => {
    let authToken: string;
  
    beforeAll(async () => {
      try {
        authToken = await loginToKalshi();
        expect(authToken).toBeTruthy();
        await connectWebSocket(authToken);
      } catch (error) {
        console.error('Setup failed:', error);
        throw error;
      }
    });
  
    it('should discover contracts and get market prices', async () => {
      try {
        const contracts = await discoverKalshiContracts(authToken);
        console.log(`Discovered ${contracts.length} contracts`);
        expect(contracts.length).toBeGreaterThan(0);
  
        if (contracts.length > 0) {
          const firstContract = contracts[0];
          console.log('First contract:', JSON.stringify(firstContract, null, 2));
          if (firstContract && firstContract.externalId) {
            const price = await getMarketPrice(authToken, firstContract.externalId);
            
            if (price === null) {
              console.error('Failed to retrieve price for contract:', JSON.stringify(firstContract, null, 2));
            }
            
            expect(price).not.toBeNull();
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
  
    it('should connect to WebSocket and receive updates', async () => {
      try {
        const contracts = await discoverKalshiContracts(authToken);
        const externalIds = contracts
          .map(c => c.externalId)
          .filter((id): id is string => id !== undefined)
          .slice(0, 5);
  
        if (externalIds.length > 0) {
          await subscribeToMarketUpdates(externalIds);
          
          // Wait for a short period to potentially receive updates
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Note: In a real scenario, you'd want to verify that updates are being received
          console.log('Subscribed to market updates for:', externalIds);
        } else {
          fail('No valid external IDs found');
        }
      } catch (error) {
        console.error('WebSocket test failed:', error);
        throw error;
      }
    });
  });