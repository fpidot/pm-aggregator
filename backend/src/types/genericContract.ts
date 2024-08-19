export interface GenericContract {
    id?: string;
    externalId: string;
    market: string;
    title: string;
    currentPrice: number;
    lastUpdated: Date;
    category?: string;
  }