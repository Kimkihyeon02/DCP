import mongoose from 'mongoose'

const ContentSchema = new mongoose.Schema({
  // 🎨 기본 메타데이터
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: '기타' },
  thumbnail: { type: String, default: '' },

  // 🌐 IPFS / NFT 관련
  ipfsHash: { type: String, required: true },
  owner: { type: String, required: true, index: true },

  // 📈 통계 데이터
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: { type: [String], default: [] },

  // 💰 마켓플레이스 판매 관련
  listed: { type: Boolean, default: false },
  price: { type: String, default: 0 },

  // NFT TokenId
  tokenId: { type: Number, default: null },

  // 🆕 🔥 Marketplace Listing ID (컨트랙트 listItem 결과)
  listingId: { type: Number, default: null },

  // 🕒 생성일
  createdAt: { type: Date, default: Date.now },
})

// 인덱스 최적화
ContentSchema.index({ views: -1 })
ContentSchema.index({ likes: -1 })
ContentSchema.index({ listed: 1 })
ContentSchema.index({ listingId: 1 }) // 🔥 listingId 기반 조회 최적화

export default mongoose.models.Content ||
  mongoose.model('Content', ContentSchema)
