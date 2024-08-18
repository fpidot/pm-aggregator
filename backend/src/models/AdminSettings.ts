import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminSettingsData {
  dailyUpdateTime: string;
  defaultBigMoveThreshold: number;
  bigMoveThresholds: Map<string, number>;
  bigMoveTimeWindow: number;
  priceUpdateInterval: number;
  contractDiscoveryInterval: number;
  categories: string[];
}

// This interface extends Document for Mongoose usage
export interface IAdminSettings extends IAdminSettingsData, Document {}

const AdminSettingsSchema: Schema = new Schema({
  dailyUpdateTime: { type: String, required: true, default: '09:00' },
  defaultBigMoveThreshold: { type: Number, required: true, default: 0.05 },
  bigMoveThresholds: {
    type: Map,
    of: Number,
    default: new Map()
  },
  bigMoveTimeWindow: { type: Number, required: true, default: 6 }, // in hours
  priceUpdateInterval: { type: Number, required: true, default: 1 }, // in minutes
  contractDiscoveryInterval: { type: Number, required: true, default: 6 }, // in hours
  categories: { type: [String], required: true, default: [] }
});

export default mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);