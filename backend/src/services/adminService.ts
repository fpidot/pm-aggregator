import AdminSettings, { IAdminSettings } from '../models/AdminSettings';
import Contract, { IContract } from '../models/Contract';

export type AlertSettings = IAdminSettings;

export async function getAdminSettings() {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    throw new Error('Admin settings not found');
  }
  return settings;
}

export const updateAdminSettings = async (newSettings: Partial<AlertSettings>): Promise<IAdminSettings> => {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    throw new Error('Admin settings not found');
  }

  // Update fields if they are provided in newSettings
  if (newSettings.dailyUpdateTime !== undefined) {
    settings.dailyUpdateTime = newSettings.dailyUpdateTime;
  }
  if (newSettings.defaultBigMoveThreshold !== undefined) {
    settings.defaultBigMoveThreshold = newSettings.defaultBigMoveThreshold;
  }
  if (newSettings.bigMoveTimeWindow !== undefined) {
    settings.bigMoveTimeWindow = newSettings.bigMoveTimeWindow;
  }
  if (newSettings.priceUpdateInterval !== undefined) {
    settings.priceUpdateInterval = newSettings.priceUpdateInterval;
  }
  if (newSettings.contractDiscoveryInterval !== undefined) {
    settings.contractDiscoveryInterval = newSettings.contractDiscoveryInterval;
  }

  // Handle category updates
  if (newSettings.categories) {
    const newCategories = newSettings.categories;
    const oldCategories = settings.categories;

    // Add new categories
    newCategories.forEach(category => {
      if (!oldCategories.includes(category)) {
        oldCategories.push(category);
        // Set default big move threshold for new category
        if (!settings.bigMoveThresholds.has(category)) {
          settings.bigMoveThresholds.set(category, settings.defaultBigMoveThreshold);
        }
      }
    });

    // Remove categories that are no longer present
    settings.categories = oldCategories.filter(category => newCategories.includes(category));

    // Clean up bigMoveThresholds for removed categories
    Array.from(settings.bigMoveThresholds.keys()).forEach(category => {
      if (!newCategories.includes(category)) {
        settings.bigMoveThresholds.delete(category);
      }
    });
  }

  await settings.save();
  return settings;
};

export const updateBigMoveThreshold = async (category: string, threshold: number): Promise<IAdminSettings> => {
  const settings = await AdminSettings.findOne();
  if (!settings) {
    throw new Error('Admin settings not found');
  }

  if (!settings.categories.includes(category)) {
    throw new Error(`Category '${category}' not found`);
  }

  settings.bigMoveThresholds.set(category, threshold);
  await settings.save();
  return settings;
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