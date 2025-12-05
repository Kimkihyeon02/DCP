// src/app/api/user/by-address/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const addr = (searchParams.get('address') || '').trim()
    if (!addr) {
      return NextResponse.json({ user: null })
    }

    // 대소문자 섞여 있어도 찾게 정규식 + wallet, address 둘 다 지원
    const regex = new RegExp(`^${addr}$`, 'i')

    const user = await User.findOne(
      {
        $or: [{ address: regex }, { wallet: regex }],
      },
      'nickname address wallet avatar'
    ).lean()

    return NextResponse.json({ user })
  } catch (e) {
    console.error('[BY_ADDRESS_ERROR]', e)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
