'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAdmin } from '../hooks/useAdmin'
import Link from 'next/link'
import { getSignerContract } from '../lib/contract'

export default function AdminDashboard() {
  const { isAdmin } = useAdmin()
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null) // 🔥 관리 메뉴 토글용

  /* ---------------------------------
      📌 콘텐츠 불러오기
  ---------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/content')
        const data =
          res.data.data || res.data.contents || res.data.content || []
        setContents(Array.isArray(data) ? data : [data])
      } catch (err) {
        console.error('콘텐츠 불러오기 실패:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  /* ---------------------------------
      🗑 DB에서만 삭제
  ---------------------------------- */
  const handleDeleteDB = async (id: string) => {
    if (!confirm('정말 DB에서만 삭제할까요?')) return
    try {
      await axios.delete(`/api/content/${id}`)
      setContents((prev) => prev.filter((item) => item._id !== id))
      alert('DB에서 삭제 완료')
    } catch (err: any) {
      alert('삭제 실패: ' + err.message)
    }
  }

  /* ---------------------------------
      🔥 NFT 소각 + DB 삭제
  ---------------------------------- */
  const handleDeleteBurn = async (item: any) => {
    if (!confirm('NFT 소각 + DB 삭제를 진행할까요?')) return

    try {
      if (!item.tokenId) {
        alert('tokenId 없음 → NFT가 존재하지 않는 콘텐츠입니다.')
        return
      }

      const nft = await getSignerContract('NFT')
      const tx = await nft.burn(Number(item.tokenId))
      await tx.wait()

      await axios.delete(`/api/content/${item._id}`)

      setContents((prev) => prev.filter((x) => x._id !== item._id))
      alert('NFT 소각 + DB 삭제 완료!')
    } catch (err: any) {
      console.error(err)
      alert('소각 실패: ' + err.message)
    }
  }

  /* ---------------------------------
      🛡 관리자 체크
  ---------------------------------- */
  if (!isAdmin)
    return (
      <p className="text-center mt-20 text-red-500">
        관리자만 접근 가능합니다.
      </p>
    )

  if (loading)
    return <p className="text-center mt-20 text-gray-500">불러오는 중...</p>

  /* ---------------------------------
      📊 통계 계산
  ---------------------------------- */
  const totalViews = contents.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalLikes = contents.reduce((sum, c) => sum + (c.likes || 0), 0)

  return (
    <section className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">📊 관리자 대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">총 콘텐츠 수</h3>
          <p className="text-2xl font-bold">{contents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">총 조회수</h3>
          <p className="text-2xl font-bold">{totalViews}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">총 좋아요 수</h3>
          <p className="text-2xl font-bold">{totalLikes}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">최근 업로드</h3>
          <p className="text-2xl font-bold">
            {contents[0]
              ? new Date(contents[0].createdAt).toLocaleDateString('ko-KR')
              : '-'}
          </p>
        </div>
      </div>

      {/* 최근 콘텐츠 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📁 최근 콘텐츠</h2>
        
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">제목</th>
              <th className="p-2 text-center">조회수</th>
              <th className="p-2 text-center">좋아요</th>
              <th className="p-2 text-center">작성자</th>
              <th className="p-2 text-center">등록일</th>
              <th className="p-2 text-center">관리</th>
            </tr>
          </thead>

          <tbody>
            {contents.slice(0, 10).map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50 relative">
                <td className="p-2 font-medium text-gray-800">
                  {c.title || '(제목 없음)'}
                </td>
                <td className="text-center">{c.views ?? 0}</td>
                <td className="text-center">{c.likes ?? 0}</td>
                <td className="text-center text-gray-500">
                  {c.owner?.length > 12
                    ? `${c.owner.slice(0, 6)}...${c.owner.slice(-4)}`
                    : c.owner || '정보 없음'}
                </td>
                <td className="text-center">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('ko-KR')
                    : '-'}
                </td>

                {/* -------------------------
                     🔧 관리 버튼 + 토글 메뉴
                   ------------------------- */}
                <td className="text-center relative">
                  <button
                    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-black text-sm"
                    onClick={() =>
                      setOpenMenu(openMenu === c._id ? null : c._id)
                    }
                  >
                    관리
                  </button>

                  {openMenu === c._id && (
                    <div className="absolute top-8 right-0 bg-white border rounded shadow-lg z-10 w-40">
                      <button
                        onClick={() => handleDeleteDB(c._id)}
                        className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 text-red-600"
                      >
                        DB에서만 삭제
                      </button>
                      <button
                        onClick={() => handleDeleteBurn(c)}
                        className="block w-full text-left text-sm px-4 py-2 hover:bg-gray-100 text-red-700"
                      >
                        NFT 소각 + DB삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex justify-end">
  <Link
    href="/admin/tx-stats"
    className="
      inline-flex items-center gap-2
      bg-gradient-to-r from-blue-600 to-blue-500
      hover:from-blue-700 hover:to-blue-600
      text-white font-semibold shadow-lg
      px-6 py-3 rounded-xl transition-all
    "
  >
    📊 <span>수익 · 거래 통계 보기</span>
  </Link>
</div>


    </section>
  )
}
