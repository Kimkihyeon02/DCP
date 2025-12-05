import NFT_ABI from "../lib/abi/NFT.json";
import MARKET_ABI from "../lib/abi/Marketplace.json";
import TOKEN_ABI from "../lib/abi/Token.json";
import ROYALTY_ABI from "../lib/abi/RoyaltyDistributor.json";

export const CONTRACTS = {
  NFT: {
    address: process.env.NEXT_PUBLIC_NFT_ADDRESS!,
    abi: NFT_ABI,
  },
  Marketplace: {
    address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
    abi: MARKET_ABI,
  },
  Token: {
    address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
    abi: TOKEN_ABI,
  },
  Royalty: {
    address: process.env.NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS!,
    abi: ROYALTY_ABI,
  },
};
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;