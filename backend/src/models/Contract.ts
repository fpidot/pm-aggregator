import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
  title: { type: String, required: true },
  market: { type: String, required: true },
  category: { type: String, required: true, enum: ['Elections', 'Economy', 'Geopolitics'] },
  currentPrice: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
  isDisplayed: { type: Boolean, default: false },
});

export default mongoose.model('Contract', ContractSchema);