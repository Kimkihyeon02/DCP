import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/db";
import MarketEvent from "../../../models/MarketEvent";

export async function GET() {
  await connectDB();
  const events = await MarketEvent.find().sort({ timestamp: -1 }).limit(30);
  return NextResponse.json(events);
}
