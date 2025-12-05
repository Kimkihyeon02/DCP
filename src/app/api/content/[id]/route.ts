import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'
import { connectDB } from '../../../lib/db'
import Content from '../../../models/Content'

/* ============================================================
   GET /api/content/[id]
============================================================ */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    await connectDB()

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { tokenId: id }

    const content = await Content.findOne(query)

    if (!content) {
      return NextResponse.json(
        { error: '콘텐츠를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, content })
  } catch (err) {
    return NextResponse.json(
      { error: '콘텐츠 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

/* ============================================================
   PATCH /api/content/[id]
   - 조회수 증가
   - 좋아요
   - 판매 등록
   - 판매 해제
   - 가격 수정 (현재 UI에서는 미사용)
============================================================ */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    await connectDB()

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { tokenId: id }

    const content = await Content.findOne(query)

    if (!content) {
      return NextResponse.json(
        { error: '존재하지 않는 콘텐츠입니다.' },
        { status: 404 }
      )
    }

    // body 파싱
    let body: any = {}
    try {
      body = await req.json()
    } catch {}

    const { type, address, price, listingId } = body

    /* ============================================================
       1) 조회수 증가
    ============================================================= */
    if (type === 'view' || !type) {
      const cookieStore = await cookies()
      const key = `viewed_${id}`

      // 1시간 동안 중복 조회수 방지
      if (!cookieStore.get(key)) {
        content.views += 1
        await content.save()

        const res = NextResponse.json({ success: true, views: content.views })
        res.cookies.set(key, '1', { maxAge: 3600, path: '/' })
        return res
      }

      return NextResponse.json({ success: true, views: content.views })
    }

    /* ============================================================
       2) 좋아요
    ============================================================= */
    if (type === 'like' && address) {
      const liked = content.likedBy.includes(address)

      if (liked) {
        // 좋아요 취소
        content.likedBy = content.likedBy.filter((a: string) => a !== address)
        content.likes = Math.max(0, content.likes - 1)
      } else {
        // 좋아요 추가
        content.likedBy.push(address)
        content.likes += 1
      }

      await content.save()

      return NextResponse.json({
        success: true,
        likes: content.likes,
        liked: !liked,
      })
    }

    /* ============================================================
       3) 판매 등록
    ============================================================= */
    if (type === 'list') {
      if (!price)
        return NextResponse.json(
          { error: '판매 가격이 필요합니다.' },
          { status: 400 }
        )

      if (!listingId)
        return NextResponse.json({ error: 'listingId 누락' }, { status: 400 })

      content.listed = true
      content.price = String(price)
      content.listingId = Number(listingId)
      await content.save()

      return NextResponse.json({
        success: true,
        listed: true,
        price: content.price,
        listingId: content.listingId,
      })
    }

    /* ============================================================
       4) 판매 해제
    ============================================================= */
    if (type === 'unlist') {
      content.listed = false
      content.price = '0'
      await content.save()

      return NextResponse.json({ success: true, listed: false })
    }

    /* ============================================================
       5) 가격 수정 (현재 UI에서는 사용 X)
    ============================================================= */
    if (type === 'updatePrice') {
      if (!price)
        return NextResponse.json(
          { error: '가격이 필요합니다.' },
          { status: 400 }
        )

      content.price = String(price)
      await content.save()

      return NextResponse.json({
        success: true,
        price: content.price,
      })
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  } catch (err) {
    console.error('PATCH 오류:', err)
    return NextResponse.json(
      { error: '업데이트 중 오류 발생' },
      { status: 500 }
    )
  }
}

/* ============================================================
   DELETE /api/content/[id]
============================================================ */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  try {
    await connectDB()

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { tokenId: id }

    const deleted = await Content.findOneAndDelete(query)

    if (!deleted) {
      return NextResponse.json(
        { error: '삭제할 콘텐츠가 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: '삭제 중 오류 발생' }, { status: 500 })
  }
}
