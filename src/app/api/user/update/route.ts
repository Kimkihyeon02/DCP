import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { address, nickname, bio, avatar } = await req.json();
    if (!address) return NextResponse.json({ error: "지갑 주소 누락" }, { status: 400 });

    const updated = await User.findOneAndUpdate(
      { address },
      { nickname, bio, avatar },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("❌ 사용자 업데이트 실패:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
