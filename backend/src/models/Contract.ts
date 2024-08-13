import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  title: string;
  market: string;
  category: string;
  currentPrice: number;
  lastUpdated: Date;
  isDisplayed: boolean;
  isFollowed: boolean;
  externalId: string;
  priceHistory: Array<{ price: number; timestamp: Date }>;
  lastAlertPrice?: number;
  lastAlertTime?: Date;
}

const ContractSchema: Schema = new Schema({
  title: { type: String, required: true },
  market: { type: String, required: true },
  category: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  isDisplayed: { type: Boolean, default: false },
  isFollowed: { type: Boolean, default: false },
  externalId: { type: String, required: true },
  priceHistory: [{ price: Number, timestamp: Date }],
  lastAlertPrice: { type: Number },
  lastAlertTime: { type: Date }
});

export default mongoose.model<IContract>('Contract', ContractSchema);