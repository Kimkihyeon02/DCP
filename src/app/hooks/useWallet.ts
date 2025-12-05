'use client'
import { useState, useEffect, useCallback } from 'react'

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<string>('')

  // 메타마스크 연결 함수 (useCallback으로 참조 고정)
  const connect = useCallback(async () => {
    const { ethereum } = window as any
    if (!ethereum) {
      alert('MetaMask를 설치해주세요.')
      return
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const addr = accounts[0]
      setAddress(addr)
      localStorage.setItem('walletAddress', addr)
      console.log('✅ 연결된 메타마스크 주소:', addr)

      const chainId = await ethereum.request({ method: 'eth_chainId' })
      setNetwork(chainId)
    } catch (err) {
      console.error('❌ MetaMask 연결 실패:', err)
    }
  }, [])

  // 🔄 localStorage 복원 (처음 한 번만 실행)
  useEffect(() => {
    const saved = localStorage.getItem('walletAddress')
    if (saved) {
      setAddress(saved)
      console.log('♻️ 저장된 지갑 복원:', saved)
    }
  }, [])

  // 🔄 계정/네트워크 변경 감지
  useEffect(() => {
    const { ethereum } = window as any
    if (!ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      const addr = accounts[0] || null
      console.log('🔄 계정 변경 감지:', addr)
      setAddress(addr)
      if (addr) localStorage.setItem('walletAddress', addr)
      else localStorage.removeItem('walletAddress')
    }

    const handleChainChanged = (chainId: string) => {
      console.log('🔄 네트워크 변경 감지:', chainId)
      setNetwork(chainId)
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)

    // ✅ cleanup으로 이벤트 중복 방지
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
      ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  useEffect(() => {
    console.log('📡 현재 상태 | 주소:', address, '| 네트워크:', network)
  }, [address, network])

  return { address, connect, network }
}
