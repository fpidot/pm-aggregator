import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  title: string;
  market: string;
  externalId: string;
  category: string;
  currentPrice: number;
  priceHistory: Array<{ price: number; timestamp: Date }>;
  lastUpdated: Date;
  isDisplayed: boolean;
  isFollowed: boolean;
  lastAlertPrice?: number;
  lastAlertTime?: Date;
}

const ContractSchema: Schema = new Schema({
  title: { type: String, required: true },
  market: { type: String, required: true },
  externalId: { type: String, required: true },
  category: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  priceHistory: [{ price: Number, timestamp: Date }],
  lastUpdated: { type: Date, default: Date.now },
  isDisplayed: { type: Boolean, default: false },
  isFollowed: { type: Boolean, default: false },
  lastAlertPrice: { type: Number },
  lastAlertTime: { type: Date }
});

export default mongoose.model<IContract>('Contract', ContractSchema);