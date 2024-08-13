import mongoose from 'mongoose';
import { Category, CATEGORIES } from '../config/categories';

const ContractSchema = new mongoose.Schema({
  title: { type: String, required: true },
  market: { type: String, required: true },
  category: { type: String, required: true, enum: CATEGORIES },
  currentPrice: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  isDisplayed: { type: Boolean, default: false },
  isFollowed: { type: Boolean, default: false },
  externalId: { type: String, required: true }
});

export default mongoose.model('Contract', ContractSchema);