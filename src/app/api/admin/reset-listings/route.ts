import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Content from '@/models/Content'

export async function POST() {
  try {
    await connectDB()

    // 모든 콘텐츠에서 listing 관련 필드 초기화
    const result = await Content.updateMany(
      {},
      {
        $set: {
          listed: false,
          listingId: null,
          price: 0
        }
      }
    )

    return NextResponse.json(
      {
        ok: true,
        message: '모든 listing 데이터 초기화 완료',
        modifiedCount: result.modifiedCount
      },
      { status: 200 }
    )
  } catch (err:any) {
    console.error('reset-listings 오류:', err)
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    )
  }
}
