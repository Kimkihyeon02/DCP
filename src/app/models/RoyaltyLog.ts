import mongoose, { Schema, models } from "mongoose";

const RoyaltyLogSchema = new Schema({
  txHash: { type: String, required: true },
  tokenId: { type: Number, required: true },
  nftContract: { type: String, required: true },
  royaltyReceiver: { type: String, required: true },
  royaltyAmount: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default models.RoyaltyLog || mongoose.model("RoyaltyLog", RoyaltyLogSchema);
