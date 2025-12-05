'use client'
import Link from 'next/link'
import { ipfsToGateway } from '../lib/utils'

export function ContentCard({ content }: { content: any }) {
  const imageSrc = ipfsToGateway(content.thumbnail || content.ipfsHash || '')

  return (
    <Link
      href={`/content/${content._id}`}
      className="block bg-white rounded-xl border border-gray-700 hover:border-indigo-500 
                 transition p-3 w-[240px] mx-auto shadow-sm hover:shadow-2xl"
    >
      {/* ✅ 썸네일 */}
      <div className="w-full h-[180px] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={content.title || 'NFT 이미지'}
          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
          className="object-contain w-full h-full"
        />
      </div>

      {/* ✅ 카드 본문 */}
      <div className="mt-3">
        {/* 제목 → 밝은 회색 → 검정색으로 변경 */}
        <h3 className="text-base font-semibold text-black truncate">
          {content.title || '제목 없음'}
        </h3>

        {/* 설명 → text-gray-400 → text-black */}
        <p className="text-xs text-black line-clamp-2 mt-1">
          {content.description || '설명이 없습니다.'}
        </p>

        {/* 조회수/좋아요 → text-gray-500 → text-black */}
        <div className="flex justify-between items-center text-[11px] text-black mt-2">
          <span>👁️ {content.views || 0}</span>
          <span>❤️ {content.likes || 0}</span>
        </div>
      </div>
    </Link>
  )
}
