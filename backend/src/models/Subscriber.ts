import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
  phoneNumber: string;
  categories: string[];
  alertPreferences: {
    dailyUpdates: boolean;
    bigMoves: boolean;
  };
  mutedUntil?: Date;
}

const SubscriberSchema: Schema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  categories: [{ type: String }],
  alertPreferences: {
    dailyUpdates: { type: Boolean, default: true },
    bigMoves: { type: Boolean, default: true }
  },
  mutedUntil: { type: Date }
});

export default mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);