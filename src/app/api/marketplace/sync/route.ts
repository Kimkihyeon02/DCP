import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { connectDB } from "../../../lib/db";
import MarketEvent from "../../../models/MarketEvent";
import MARKET_ABI from "../../../lib/abi/Marketplace.json";

export async function GET() {
  try {
    await connectDB();

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const marketplace = new ethers.Contract(
      process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
      MARKET_ABI,
      provider
    );

    // 최근 5000블록의 이벤트만 가져오기
    const listed = await marketplace.queryFilter("Listed", -5000);
    const sold = await marketplace.queryFilter("Sold", -5000);
    const cancelled = await marketplace.queryFilter("Cancelled", -5000);

    // 타입 캐스팅으로 TS 경고 해결
    const all = [...listed, ...sold, ...cancelled] as any[];

    for (const e of all) {
      const ev = e as any; // ethers.EventLog 형식으로 강제
      const exists = await MarketEvent.findOne({ txHash: ev.transactionHash });
      if (!exists) {
        const args = ev.args || {};
        const { id, nft, tokenId, seller, price, buyer } = args;

        await MarketEvent.create({
          eventType: ev.eventName || "Unknown",
          listingId: Number(id),
          nft,
          tokenId: Number(tokenId),
          seller,
          buyer: ev.eventName === "Sold" ? buyer : "",
          price: price?.toString() || "",
          txHash: ev.transactionHash,
        });
      }
    }

    return NextResponse.json({ success: true, count: all.length });
  } catch (err: any) {
    console.error("📛 Sync Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
