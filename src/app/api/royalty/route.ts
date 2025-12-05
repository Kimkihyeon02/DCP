import { NextResponse } from "next/server";
import { ethers } from "ethers";
import RoyaltyLog from "../../models/RoyaltyLog";
import { connectDB } from "../../lib/db";

export async function POST(req: Request) {
  try {
    const { tokenId, salePrice } = await req.json();
    if (!tokenId || !salePrice)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    await connectDB();

    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const distributor = new ethers.Contract(
      process.env.NEXT_PUBLIC_ROYALTY_DISTRIBUTOR_ADDRESS!,
      [
        "function distributeRoyalty(address nftContract,uint256 tokenId,uint256 salePrice) external payable returns(address,uint256)"
      ],
      wallet
    );

    // distributeRoyalty 실행
    const tx = await distributor.distributeRoyalty(
      process.env.NEXT_PUBLIC_NFT_ADDRESS!,
      tokenId,
      salePrice,
      { value: salePrice }
    );
    const receipt = await tx.wait();

    // 트랜잭션 이벤트 로그에서 로열티 수취자와 금액 파싱
    const iface = new ethers.Interface([
      "event RoyaltyPaid(address indexed nftContract,uint256 indexed tokenId,address indexed receiver,uint256 amount)"
    ]);

    const log = receipt.logs
  .map((l: any) => {
    try {
      return iface.parseLog(l);
    } catch {
      return null;
    }
  })
  .filter((v: any) => v)[0];

    const royaltyReceiver = log?.args.receiver ?? "Unknown";
    const royaltyAmount = log?.args.amount?.toString() ?? salePrice;

    // DB 저장
    await RoyaltyLog.create({
      txHash: receipt.hash,
      tokenId,
      nftContract: process.env.NEXT_PUBLIC_NFT_ADDRESS!,
      royaltyReceiver,
      royaltyAmount,
    });

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      receiver: royaltyReceiver,
      amount: royaltyAmount,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
