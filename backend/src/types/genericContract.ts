export interface GenericContract {
  
    id?: string;
    ticker?: string;
    name?: string;
    question?: string;
    title?: string;
    shortName?: string;
    status?: string;
    lastTradePrice?: number;
    last_price?: number;
    probability?: number;
    outcomePrices?: number[];
    market: string;
    category?: string;
  }