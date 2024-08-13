import AdminSettings, { IAdminSettings } from '../models/AdminSettings';
import Contract, { IContract } from '../models/Contract';

export type AlertSettings = IAdminSettings;

export const getAdminSettings = async (): Promise<AlertSettings> => {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    throw new Error('Admin settings not found');
  }
  return settings;
};

export const updateAdminSettings = async (newSettings: Partial<AlertSettings>): Promise<void> => {
  await AdminSettings.findOneAndUpdate({}, newSettings, { upsert: true });
};

export const followContract = async (contractId: string): Promise<IContract> => {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.isFollowed = true;
    await contract.save();
    return contract;
  };
  
  export const unfollowContract = async (contractId: string): Promise<IContract> => {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.isFollowed = false;
    contract.isDisplayed = false;
    await contract.save();
    return contract;
  };
  
  export const displayContract = async (contractId: string): Promise<IContract> => {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    if (!contract.isFollowed) {
      throw new Error('Contract must be followed before it can be displayed');
    }
    contract.isDisplayed = true;
    await contract.save();
    return contract;
  };
  
  export const hideContract = async (contractId: string): Promise<IContract> => {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.isDisplayed = false;
    await contract.save();
    return contract;
  };
  
  export const updateContractCategory = async (contractId: string, category: "Elections" | "Economy" | "Geopolitics"): Promise<IContract> => {
    const contract = await Contract.findById(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }
    contract.category = category;
    await contract.save();
    return contract;
  };