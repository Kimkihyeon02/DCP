// src/app/api/search/route.ts
import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Content from '@/models/Content'
import User from '@/models/User'

export async function GET(req: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()

    if (!q) {
      return NextResponse.json([])
    }

    const regex = new RegExp(q, 'i')

    // 1) 제목/설명으로 검색
    const textResults = await Content.find(
      {
        $or: [{ title: regex }, { description: regex }],
      },
      '_id title description owner thumbnail ipfsHash views likes'
    )
      .sort({ createdAt: -1 })
      .lean()

    // 2) 닉네임으로 유저 검색
    const users = (await User.find(
      { nickname: regex },
      'address'
    ).lean()) as any[]

    let nicknameResults: any[] = []

    if (users.length > 0) {
      const addresses = users.map((u) => u.address)
      nicknameResults = await Content.find(
        { owner: { $in: addresses } },
        '_id title description owner thumbnail ipfsHash views likes'
      )
        .sort({ createdAt: -1 })
        .lean()
    }

    // 3) 결과 합치고 중복 제거
    const map = new Map<string, any>()
    ;[...textResults, ...nicknameResults].forEach((c: any) => {
      map.set(String(c._id), c)
    })

    const merged = Array.from(map.values())

    return NextResponse.json(merged)
  } catch (e) {
    console.error('[SEARCH_API_ERROR]', e)
    return NextResponse.json({ error: 'search failed' }, { status: 500 })
  }
}
