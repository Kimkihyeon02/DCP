'use client'
import { useEffect, useState } from 'react'
import { useWallet } from './useWallet'

export function useAdmin() {
  const { address } = useWallet()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!address) {
      console.log('⚠️ 아직 지갑 주소가 연결되지 않음')
      return
    }

    const envAddr =
      process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES ||
      process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS

    console.log('📁 ENV 관리자 주소:', envAddr)

    if (!envAddr) {
      console.warn('🚫 NEXT_PUBLIC_ADMIN_WALLET_ADDRESS 환경변수가 없습니다!')
      return
    }

    const admin = envAddr.trim().toLowerCase()
    const current = address.trim().toLowerCase()
    console.log('🔍 비교:', { admin, current })

    const match = current === admin
    setIsAdmin(match)
    console.log(match ? '✅ 관리자 권한 확인 완료' : '❌ 관리자 아님')
  }, [address])

  return { isAdmin }
}
