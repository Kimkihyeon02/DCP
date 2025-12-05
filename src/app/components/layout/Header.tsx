'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletUser } from '../../hooks/useWalletUser'

export function Header() {
  const router = useRouter()
  const { address, connect, disconnect } = useWalletUser()
  const [query, setQuery] = useState('')

  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <header className="bg-white border-b border-pink-200 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center px-4 py-4">
        {/* 왼쪽: 로고 */}
        <div className="w-40 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/favicon.ico"
              alt="DCP"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-xl font-extrabold text-gray-900">DCP</span>
          </Link>
        </div>

        {/* 가운데: 메뉴 (글자만 살짝 키움) */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-6 text-[15px] text-gray-800">
            <Link href="/marketplace/list" className="hover:text-pink-600">
              마켓플레이스
            </Link>
            <Link href="/upload" className="hover:text-pink-600">
              업로드
            </Link>
            <Link href="/ranking" className="hover:text-pink-600">
              랭킹
            </Link>
            <Link
              href={address ? `/profile/${address}` : '/profile'}
              className="hover:text-pink-600"
            >
              프로필
            </Link>

            {adminWallet &&
              address?.toLowerCase() === adminWallet.toLowerCase() && (
                <Link href="/admin" className="text-red-600 font-semibold">
                  관리자
                </Link>
              )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색… (꜆🔎ω･´ )"
              className="px-4 py-2 text-sm border rounded-full w-64 focus:outline-pink-400"
            />
          </form>

          {address ? (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600"
            >
              {address.slice(0, 6)}...{address.slice(-4)} 로그아웃
            </button>
          ) : (
            <button
              onClick={connect}
              className="px-4 py-2 bg-pink-500 text-white text-sm rounded-full hover:bg-pink-600"
            >
              🦊 지갑 연결
            </button>
          )}
        </div>
      </nav>
    </header>
  )
}
