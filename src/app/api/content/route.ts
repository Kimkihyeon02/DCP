import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '../../lib/db'
import Content from '../../models/Content'

/**
 * GET /api/content
 * 전체 목록 조회 + 필터(owner, listed) + 정렬(sort)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const owner = searchParams.get('owner')
    const sortParam = searchParams.get('sort')
    const listedParam = searchParams.get('listed')

    // 정렬 기준
    const sortKey =
      sortParam === 'likes'
        ? 'likes'
        : sortParam === 'views'
        ? 'views'
        : 'createdAt'

    // 필터
    const filter: Record<string, any> = {}
    if (owner) filter.owner = owner
    if (listedParam === 'true') filter.listed = true

    const contents = await Content.find(filter)
      .sort({ [sortKey]: -1 })
      .limit(100)
      .lean()

    return NextResponse.json(
      { success: true, count: contents.length, data: contents },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('❌ 콘텐츠 조회 실패:', err)
    return NextResponse.json(
      {
        success: false,
        error: '콘텐츠 목록 조회 오류',
        details: err.message,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/content
 * NFT 민팅 후 tokenId 포함해 DB 저장
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const {
      title,
      description,
      ipfsHash,
      owner,
      thumbnail,
      category,
      tokenId,
    } = body

    if (!title || !ipfsHash || !owner || tokenId === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 데이터 누락 (title, ipfsHash, owner, tokenId 필요)',
        },
        { status: 400 }
      )
    }

    const newContent = await Content.create({
      title,
      description: description || '',
      ipfsHash,
      thumbnail: thumbnail || '',
      owner,
      category: category || '기타',
      tokenId,
      listed: false,
      price: 0,
      views: 0,
      likes: 0,
      likedBy: [],
    })

    return NextResponse.json(
      {
        success: true,
        message: '콘텐츠 DB 저장 완료',
        data: newContent,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('❌ 콘텐츠 업로드 실패:', err)
    return NextResponse.json(
      {
        success: false,
        error: '콘텐츠 업로드 오류',
        details: err.message,
      },
      { status: 500 }
    )
  }
}
