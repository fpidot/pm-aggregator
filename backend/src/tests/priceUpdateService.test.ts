import { updatePrices } from '../services/priceUpdateService';
import ContractModel, { IContract } from '../models/Contract';
import AdminSettingsModel, { IAdminSettings } from '../models/AdminSettings';
import * as predictItService from '../services/predictItService';
import * as kalshiService from '../services/kalshiService';
import * as polymarketService from '../services/polymarketService';
import * as manifoldService from '../services/manifoldService';

jest.mock('../models/Contract');
jest.mock('../models/AdminSettings');
jest.mock('../services/predictItService');
jest.mock('../services/kalshiService');
jest.mock('../services/polymarketService');
jest.mock('../services/manifoldService');

describe('priceUpdateService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should update prices for all contracts', async () => {
    const mockContracts: Partial<IContract>[] = [
      { _id: '1', market: 'PredictIt', externalId: 'ABC', currentPrice: 0.5, priceHistory: [], save: jest.fn() },
      { _id: '2', market: 'Kalshi', externalId: 'DEF', currentPrice: 0.7, priceHistory: [], save: jest.fn() },
      { _id: '3', market: 'Polymarket', externalId: 'GHI', currentPrice: 0.3, priceHistory: [], save: jest.fn() },
      { _id: '4', market: 'Manifold', externalId: 'JKL', currentPrice: 0.6, priceHistory: [], save: jest.fn() },
    ];

    const mockAdminSettings: Partial<IAdminSettings> = {
      bigMoveThresholds: new Map([
        ['PredictIt', 0.1],
        ['Kalshi', 0.1],
        ['Polymarket', 0.1],
        ['Manifold', 0.1],
      ]),
    };

    (ContractModel.find as jest.Mock).mockResolvedValue(mockContracts);
    (AdminSettingsModel.findOne as jest.Mock).mockResolvedValue(mockAdminSettings);
    (predictItService.fetchContractPrice as jest.Mock).mockResolvedValue(0.55);
    (kalshiService.fetchContractPrice as jest.Mock).mockResolvedValue(0.65);
    (polymarketService.fetchContractPrice as jest.Mock).mockResolvedValue(0.35);
    (manifoldService.fetchContractPrice as jest.Mock).mockResolvedValue(0.62);

    await updatePrices();

    expect(ContractModel.find).toHaveBeenCalled();
    expect(AdminSettingsModel.findOne).toHaveBeenCalled();
    expect(predictItService.fetchContractPrice).toHaveBeenCalledWith('ABC');
    expect(kalshiService.fetchContractPrice).toHaveBeenCalledWith('DEF');
    expect(polymarketService.fetchContractPrice).toHaveBeenCalledWith('GHI');
    expect(manifoldService.fetchContractPrice).toHaveBeenCalledWith('JKL');
    mockContracts.forEach(contract => {
      expect(contract.save).toHaveBeenCalled();
    });
    expect(mockContracts[0].currentPrice).toBe(0.55);
    expect(mockContracts[1].currentPrice).toBe(0.65);
    expect(mockContracts[2].currentPrice).toBe(0.35);
    expect(mockContracts[3].currentPrice).toBe(0.62);
  });

  // Add more tests here for error scenarios, big move detection, etc.
});