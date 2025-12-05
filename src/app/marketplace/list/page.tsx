'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getContract } from '@/lib/contract'
import { ipfsToGateway } from '@/lib/utils'

export default function MarketplaceList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ============================================
  // 🛒 판매중 NFT 불러오기 (listed=true)
  // ============================================
  const fetchListedItems = async () => {
    try {
      // 1) DB에서 listed = true 인 콘텐츠 호출
      const res = await fetch(`/api/content?listed=true`)
      const json = await res.json()
      let arr = json.data || []

      // 2) NFT 실제 소유자 조회
      const nft = await getContract('NFT')

      const updated = await Promise.all(
        arr.map(async (item: any) => {
          try {
            if (item.tokenId !== undefined && item.tokenId !== null) {
              const realOwner = await nft.ownerOf(Number(item.tokenId))
              return { ...item, realOwner }
            }
          } catch (err) {
            console.warn(`⚠ ownerOf 실패 → DB owner 사용 item=${item._id}`)
          }
          return { ...item, realOwner: item.owner }
        })
      )

      setItems(updated)
    } catch (err) {
      console.error('❌ 판매중 NFT 불러오기 오류:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListedItems()
  }, [])

  if (loading)
    return <p className="text-center mt-20 text-gray-500">불러오는 중...</p>

  return (
    <section className="max-w-6xl mx-auto px-4 mt-10">
      <h1 className="text-3xl font-bold mb-8">🛒 판매 중인 NFT</h1>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          현재 판매 중인 NFT가 없습니다.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/content/${item._id}`} // 상세 페이지로 이동
              className="bg-white border rounded-lg shadow hover:shadow-lg transition p-3"
            >
              {/* NFT 이미지 */}
              <img
                src={ipfsToGateway(item.thumbnail || item.ipfsHash)}
                className="w-full h-48 object-cover rounded mb-3"
                alt={item.title}
              />

              {/* 제목 */}
              <h3 className="font-semibold truncate">{item.title}</h3>

              {/* 소유자 */}
              <p className="text-gray-500 text-sm mt-1">
                소유자:{' '}
                {item.realOwner
                  ? item.realOwner.slice(0, 6) +
                    '...' +
                    item.realOwner.slice(-4)
                  : '알 수 없음'}
              </p>

              {/* 가격 */}
              <p className="text-blue-600 font-bold mt-2">
                💰 가격: {item.price} ETH
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
