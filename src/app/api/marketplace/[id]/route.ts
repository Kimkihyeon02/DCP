import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import Content from "../../../models/Content";

/**
 * GET /api/marketplace/[id]
 * listingId 기반 판매 정보 조회
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();

    // listingId로 찾기
    const content = await Content.findOne({ listingId: Number(id) });

    if (!content) {
      return NextResponse.json(
        { error: "listingId에 해당하는 상품 없음" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tokenId: content.tokenId,
      price: content.price,
      seller: content.owner,
      listed: content.listed,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
