export interface Contract {
    _id: string;
    title: string;
    currentPrice: number;
    category: string;
    // Add other necessary fields
  }
  
export interface UserPreferences {
  categories: string[];
  alertPreferences: {
    dailyUpdates: boolean;
    bigMoves: boolean;
  };
  phoneNumber: string;
}