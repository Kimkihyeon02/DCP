import mongoose, { Schema, models } from "mongoose";

const MarketEventSchema = new Schema({
  eventType: { type: String, required: true }, // Listed | Sold | Cancelled
  listingId: { type: Number, required: true },
  nft: String,
  tokenId: Number,
  seller: String,
  buyer: String,
  price: String,
  txHash: String,
  timestamp: { type: Date, default: Date.now },
});

export default models.MarketEvent || mongoose.model("MarketEvent", MarketEventSchema);
