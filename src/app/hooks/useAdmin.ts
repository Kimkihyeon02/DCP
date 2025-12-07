'use client'
import { useEffect, useState } from 'react'
import { useWallet } from './useWallet'

export function useAdmin() {
  const { address } = useWallet()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    console.log('====== 🛡 useAdmin 실행됨 ======')

    if (!address) {
      console.log('⚠️ 아직 지갑 주소가 연결되지 않음')
      setIsAdmin(false)
      return
    }

    console.log('🧍 현재 사용자 주소:', address)

    // 🔥 가능한 모든 관리자 env 값을 모아서 배열로 만든다.
    const rawList: string[] = []

    // 1) 콤마로 한 번에 넣은 경우
    if (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES) {
      console.log(
        '📌 env: NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES =',
        process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES
      )
      rawList.push(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES)
    }

    // 2) 번호 붙여서 나눠 넣은 경우
    if (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_1) {
      console.log(
        '📌 env: NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_1 =',
        process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_1
      )
      rawList.push(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_1)
    }
    if (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_2) {
      console.log(
        '📌 env: NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_2 =',
        process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_2
      )
      rawList.push(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES_2)
    }

    // 3) 예전 단일 변수 이름도 혹시 모를 대비
    if (process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS) {
      console.log(
        '📌 env: NEXT_PUBLIC_ADMIN_WALLET_ADDRESS =',
        process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS
      )
      rawList.push(process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)
    }

    console.log('📁 ENV 관리자 원본들(rawList):', rawList)

    if (rawList.length === 0) {
      console.warn('🚫 관리자 지갑 환경변수가 하나도 없습니다!')
      setIsAdmin(false)
      return
    }

    // 🔥 "0x...,0x..." 같이 들어온 것까지 쪼개서 list 생성
    const adminList = rawList
      .flatMap((v) => v.split(',')) // 콤마 기준 분리
      .map((v) => v.trim().toLowerCase()) // 공백 제거 + 소문자 통일
      .filter(Boolean) // 빈 값 제거

    console.log('👑 최종 관리자 목록(adminList):', adminList)

    const current = address.trim().toLowerCase()

    console.log('🧍 비교할 현재 주소:', current)

    const match = adminList.includes(current)
    setIsAdmin(match)

    console.log(match ? '🎉 관리자 권한 확인 완료!' : '❌ 관리자 아님')
  }, [address])

  return { isAdmin }
}
