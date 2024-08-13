import mongoose, { Document, Schema } from 'mongoose';
import { Category, CATEGORIES } from '../config/categories';

export interface ISubscriber extends Document {
  phoneNumber: string;
  categories: Category[];
  receiveDailyUpdates: boolean;
  receiveBigMoveAlerts: boolean;
}

const SubscriberSchema: Schema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  categories: [{ type: String, enum: CATEGORIES }],
  receiveDailyUpdates: { type: Boolean, default: false },
  receiveBigMoveAlerts: { type: Boolean, default: false },
});

export default mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);