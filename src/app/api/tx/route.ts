import { NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import Tx from '../../models/Tx'

console.log('🔥 HIT /api/tx')

export async function POST(req: Request) {
  await connectDB()
  const body = await req.json()

  await Tx.create(body)

  return NextResponse.json({ success: true })
}
