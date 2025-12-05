'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useWalletUser } from '@/hooks/useWalletUser'

export default function ProfileIndexPage() {
  const router = useRouter()
  const { address } = useWalletUser()

  useEffect(() => {
    if (!address) return
    // 🔥 로그인 되어 있으면 자기 프로필로 리다이렉트
    router.replace(`/profile/${address}`)
  }, [address, router])

  if (!address) {
    return (
      <section className="max-w-xl mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
        <p className="text-gray-600">
          프로필 페이지를 보려면 지갑 로그인 후 이용해주세요.
        </p>
      </section>
    )
  }

  // **주소는 있는데 아직 router가 이동 중**일 때 빈 곳이 보이지 않게 로딩 처리
  return (
    <section className="max-w-xl mx-auto mt-20 text-center">
      <p className="text-gray-500">프로필 페이지로 이동 중...</p>
    </section>
  )
}
