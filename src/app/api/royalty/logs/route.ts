import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import RoyaltyLog from "../../../models/RoyaltyLog";

export async function GET() {
  await connectDB();
  const logs = await RoyaltyLog.find().sort({ timestamp: -1 }).limit(20);
  return NextResponse.json(logs);
}
