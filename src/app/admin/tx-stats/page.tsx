'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

// 주소 축약 함수
const shorten = (addr: string | undefined) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '-'

// 숫자 소수점 다듬기
const formatNum = (v: any) => Number(v || 0).toFixed(5)

interface TxLog {
  tokenId: number
  nft: string
  price: string
  seller: string
  buyer: string
  platformFee: string
  royaltyAmount: string
  timestamp: number
}

export default function TxStats() {
  const [list, setList] = useState<TxLog[]>([])

  useEffect(() => {
    axios.get('/api/tx/all').then((res) => {
      setList(res.data.data || [])
    })
  }, [])

  const totalVolume = list.reduce((s, x) => s + Number(x.price || 0), 0)
  const totalPlatform = list.reduce((s, x) => s + Number(x.platformFee || 0), 0)
  const totalRoyalty = list.reduce(
    (s, x) => s + Number(x.royaltyAmount || 0),
    0
  )

  return (
    <section className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        📊 거래 / 수익 통계
      </h1>

      {/* ===== 요약 카드 ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-5 bg-white shadow-sm border rounded-xl">
          <p className="text-gray-500 text-sm">총 거래량</p>
          <h2 className="text-2xl font-bold mt-1">
            {formatNum(totalVolume)} ETH
          </h2>
        </div>

        <div className="p-5 bg-white shadow-sm border rounded-xl">
          <p className="text-gray-500 text-sm">총 플랫폼 수익</p>
          <h2 className="text-2xl font-bold mt-1">
            {formatNum(totalPlatform)} ETH
          </h2>
        </div>

        <div className="p-5 bg-white shadow-sm border rounded-xl">
          <p className="text-gray-500 text-sm">총 로열티 지급</p>
          <h2 className="text-2xl font-bold mt-1">
            {formatNum(totalRoyalty)} ETH
          </h2>
        </div>
      </div>

      {/* ===== 거래 테이블 ===== */}
      <div className="overflow-x-auto bg-white shadow-sm border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 text-left">
              <th className="p-3">Token</th>
              <th className="p-3">가격(ETH)</th>
              <th className="p-3">수수료</th>
              <th className="p-3">로열티</th>
              <th className="p-3">판매자</th>
              <th className="p-3">구매자</th>
              <th className="p-3">시간</th>
            </tr>
          </thead>

          <tbody>
            {list.map((x, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{x.tokenId}</td>
                <td className="p-3">{formatNum(x.price)}</td>
                <td className="p-3">{formatNum(x.platformFee)}</td>
                <td className="p-3">{formatNum(x.royaltyAmount)}</td>
                <td className="p-3 font-mono">{shorten(x.seller)}</td>
                <td className="p-3 font-mono">{shorten(x.buyer)}</td>
                <td className="p-3 text-gray-500">
                  {isNaN(x.timestamp)
                    ? '-'
                    : new Date(x.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
