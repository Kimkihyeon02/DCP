import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  nickname: { type: String, default: "" },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" }, // IPFS CID or URL
  joinedAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
