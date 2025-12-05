import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Content from "../../models/Content";

/**
 * 콘텐츠 조회 API
 * - /api/content → 전체 목록 (조회수 순)
 * - /api/content?sort=likes → 좋아요 순 정렬
 * - /api/content?owner=0x123... → 특정 사용자의 콘텐츠만
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const sortKey = searchParams.get("sort") === "likes" ? "likes" : "views";
    const owner = searchParams.get("owner");

    const filter: Record<string, any> = {};
    if (owner) filter.owner = owner;

    const contents = await Content.find(filter)
      .sort({ [sortKey]: -1, createdAt: -1 })
      .limit(50);

    return NextResponse.json(contents);
  } catch (err: any) {
    console.error("❌ 콘텐츠 조회 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * 새 콘텐츠 업로드 (POST)
 * @body { title, description, ipfsHash, owner, thumbnail, category }
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { title, description, ipfsHash, owner, thumbnail, category } = body;

    if (!title || !ipfsHash || !owner) {
      return NextResponse.json({ error: "필수 데이터 누락" }, { status: 400 });
    }

    const content = await Content.create({
      title,
      description,
      ipfsHash,
      owner,
      thumbnail,
      category,
    });

    return NextResponse.json(content, { status: 201 });
  } catch (err: any) {
    console.error("❌ 콘텐츠 업로드 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
