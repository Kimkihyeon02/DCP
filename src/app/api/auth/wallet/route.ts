import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import User from "../../../models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "지갑 주소가 필요합니다." }, { status: 400 });
    }

    // 이미 가입된 사용자인지 확인
    let user = await User.findOne({ address });
    if (!user) {
      user = await User.create({ address });
      console.log(`✅ 신규 사용자 등록: ${address}`);
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.error("로그인 오류:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
