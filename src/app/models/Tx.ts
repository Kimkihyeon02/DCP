import mongoose from "mongoose"

const TxSchema = new mongoose.Schema({
  tokenId: Number,
  nft: String,
  price: String,
  seller: String,
  buyer: String,
  platformFee: String,
  royaltyAmount: String,
  timestamp: Number,
})

export default mongoose.models.Tx || mongoose.model("Tx", TxSchema)
