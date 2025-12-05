import { NextResponse } from 'next/server'
import { connectDB } from '../../../lib/db'
import Tx from '../../../models/Tx'

export async function GET() {
  try {
    await connectDB()

    const logs = await Tx.find().sort({ timestamp: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: logs,
    })
  } catch (err: any) {
    console.error('❌ /api/tx/all 오류:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
