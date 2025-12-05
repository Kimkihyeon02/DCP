'use client'

import axios from 'axios'
import { BrowserProvider, Contract, parseEther } from 'ethers'
import MARKET_ABI from '../lib/abi/Marketplace.json'

declare global {
  interface Window {
    ethereum?: any
  }
}

/* -------------------------------------------------------
    🔥 signer + provider + Marketplace 컨트랙트 생성
------------------------------------------------------- */
const getContract = async () => {
  if (typeof window === 'undefined') throw new Error('브라우저 환경이 아님')
  if (!window.ethereum) throw new Error('MetaMask 설치 필요')

  await window.ethereum.request({ method: 'eth_requestAccounts' })

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()

  const marketAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
  if (!marketAddress) throw new Error('환경변수 NEXT_PUBLIC_MARKETPLACE_ADDRESS 누락')

  return new Contract(marketAddress, MARKET_ABI, signer)
}

/* -------------------------------------------------------
   🔥 ETH 문자열을 정규화
------------------------------------------------------- */
function normalizeEth(v: string | number) {
  let s = String(v)

  // e-7 같은 지수표기 방지
  if (s.includes('e') || s.includes('E')) {
    const num = Number(s)
    s = num.toFixed(18) // 소수점 18자리 강제 변환
  }

  // 불필요한 끝 0 제거
  s = s.replace(/\.?0+$/, '')

  return s
}

/* ============================================================
    🔥 판매 등록 (listItem)
============================================================ */
export async function listItem(
  contentId: string,
  tokenId: number,
  priceEth: string | number
) {
  try {
    const contract = await getContract()

    const nftAddress = process.env.NEXT_PUBLIC_NFT_ADDRESS
    if (!nftAddress) throw new Error('환경변수 NEXT_PUBLIC_NFT_ADDRESS 누락')

    // price → 문자열로 변환 후 처리
    const normalized = normalizeEth(priceEth)
    const priceWei = parseEther(normalized)

    const tx = await contract.listItem(nftAddress, tokenId, priceWei)
    console.log('⏳ listItem tx hash:', tx.hash)

    const receipt = await tx.wait()

    // ------------------------------
    // 📌 이벤트에서 listingId 추출
    // ------------------------------
    let listingId: string | null = null

    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log)
        if (parsed?.name === 'Listed') {
          listingId = parsed.args.id.toString()
          break
        }
      } catch {}
    }

    if (!listingId) {
      console.error('❌ 이벤트 파싱 실패:', receipt.logs)
      alert('listingId 추출 실패!')
      return null
    }

    // ------------------------------
    // 📌 DB 업데이트 (문자열 price 저장!)
    // ------------------------------
    await axios.patch(`/api/content/${contentId}`, {
      type: 'list',
      price: normalized,      // ❗ 숫자가 아니라 문자열 저장!
      listingId: Number(listingId),
    })

    alert(`판매 등록 완료!\nListing ID: ${listingId}`)
    return listingId
  } catch (err: any) {
    console.error('❌ 판매 등록 오류:', err)
    alert(`판매 등록 실패: ${err.message}`)
    return null
  }
}

/* ============================================================
    🔥 구매하기 (buyItem)
============================================================ */
export async function buyItem(listingId: number, priceEth: string | number) {
  try {
    const contract = await getContract()

    // price → 문자열 + 지수표기 방지
    const normalized = normalizeEth(priceEth)
    const value = parseEther(normalized)

    const tx = await contract.buyItem(listingId, { value })
    console.log('⏳ buyItem tx hash:', tx.hash)

    await tx.wait()

    return true
  } catch (err: any) {
    console.error('❌ 구매 오류:', err)
    alert(`구매 실패: ${err.message}`)
    return false
  }
}
