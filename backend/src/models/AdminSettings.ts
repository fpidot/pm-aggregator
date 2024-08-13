import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettings extends Document {
  dailyUpdateTime: string;
  bigMoveThresholds: Map<string, number>;
  bigMoveTimeWindow: number;
  priceUpdateInterval: number;
  contractDiscoveryInterval: number;
  categories: string[];
}

const AdminSettingsSchema: Schema = new Schema({
  dailyUpdateTime: { type: String, required: true, default: '09:00' },
  bigMoveThresholds: {
    type: Map,
    of: Number,
    default: new Map([
      ['Elections', 0.05],
      ['Economy', 0.03],
      ['Geopolitics', 0.04]
    ])
  },
  bigMoveTimeWindow: { type: Number, required: true, default: 6 }, // in hours
  priceUpdateInterval: { type: Number, required: true, default: 1 }, // in minutes
  contractDiscoveryInterval: { type: Number, required: true, default: 6 }, // in hours
  categories: { type: [String], required: true, default: ['Elections', 'Economy', 'Geopolitics'] }
});

export default mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);