export interface IAdminSettingsData {
    dailyUpdateTime: string;
    defaultBigMoveThreshold: number;
    bigMoveThresholds: Record<string, number>; // Using Record instead of Map for JSON compatibility
    bigMoveTimeWindow: number;
    priceUpdateInterval: number;
    contractDiscoveryInterval: number;
    categories: string[];
  }