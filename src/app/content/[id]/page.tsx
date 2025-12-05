'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { getContract, getSignerContract } from '../../lib/contract'
import { formatDate, ipfsToGateway } from '../../lib/utils'
import { buyItem } from '../../lib/marketplaceActions'
import { parseEther } from 'ethers'

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()

  const id = typeof params?.id === 'string' ? params.id : ''

  const [content, setContent] = useState<any>(null)
  const [editPrice, setEditPrice] = useState('')
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [address, setAddress] = useState('')
  const [uploader, setUploader] = useState('')
  const [nftOwner, setNftOwner] = useState('')

  const [uploaderName, setUploaderName] = useState('')
  const [ownerName, setOwnerName] = useState('')

  const viewedOnce = useRef(false)

  const shortenAddress = (addr: string) =>
    addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''

  const loadNickname = async (addr: string, setter: (v: string) => void) => {
    if (!addr) return
    try {
      const res = await axios.get(
        `/api/user/by-address?address=${encodeURIComponent(addr)}`
      )
      setter(res.data?.user?.nickname || shortenAddress(addr))
    } catch {
      setter(shortenAddress(addr))
    }
  }

  /* ---------------------------------
      📌 데이터 로드
  ---------------------------------- */
  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      try {
        const res = await axios.get(`/api/content/${id}`)
        const data = res.data.content || res.data

        setContent(data)
        setLikes(data.likes || 0)
        setUploader(data.owner)

        loadNickname(data.owner, setUploaderName)

        // 조회수 증가 (1회만)
        if (!viewedOnce.current) {
          viewedOnce.current = true
          await axios.patch(`/api/content/${id}`, { type: 'view' })
        }

        // 실제 NFT owner 조회
        let ownerAddress = data.owner
        if (data.tokenId !== undefined && data.tokenId !== null) {
          try {
            const nft = await getContract('NFT')
            ownerAddress = await nft.ownerOf(Number(data.tokenId))
          } catch {
            console.warn('ownerOf 조회 실패 → DB owner 사용')
          }
        }

        setNftOwner(ownerAddress)
        loadNickname(ownerAddress, setOwnerName)

        // 내 지갑 주소 로드
        if (window.ethereum) {
          const acc = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          const myAddr = acc[0]
          setAddress(myAddr)
          setIsLiked(data.likedBy?.includes(myAddr) || false)
        }
      } catch (err) {
        console.error('콘텐츠 로드 오류:', err)
      }
    }

    loadData()
  }, [id])

  /* ---------------------------------
      ❤️ 좋아요
  ---------------------------------- */
  const handleLike = async () => {
    if (!address) return alert('지갑을 연결하세요.')

    try {
      const res = await axios.patch(`/api/content/${id}`, {
        type: 'like',
        address,
      })
      setLikes(res.data.likes)
      setIsLiked(res.data.liked)
    } catch (err) {
      console.error(err)
    }
  }

  /* ---------------------------------
      🛒 판매 등록 (컨트랙트 + DB)
  ---------------------------------- */
  const handleList = async () => {
    if (!editPrice) return alert('가격 입력 필요')
    if (!content.tokenId) return alert('tokenId 없음')

    try {
      // ⭐ signer 컨트랙트 사용!!
      const contract = await getSignerContract('Marketplace')

      // ⭐ 가격은 문자열 그대로 처리 (Number 절대 금지)
      const normalizedPrice = editPrice
      const priceWei = parseEther(normalizedPrice)

      const tx = await contract.listItem(
        process.env.NEXT_PUBLIC_NFT_ADDRESS!,
        Number(content.tokenId),
        priceWei
      )

      const receipt = await tx.wait()

      // 이벤트에서 listingId 추출
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
        alert('listingId 추출 실패')
        return
      }

      // DB 업데이트 (문자열 그대로 저장)
      await axios.patch(`/api/content/${id}`, {
        type: 'list',
        price: normalizedPrice,
        listingId: Number(listingId),
      })

      alert(`판매 등록 완료! listingId = ${listingId}`)

      setContent({
        ...content,
        price: normalizedPrice,
        listed: true,
        listingId: Number(listingId),
      })
    } catch (err: any) {
      console.error(err)
      alert('판매 등록 실패: ' + err.message)
    }
  }

  /* ---------------------------------
      🛑 판매 해제
  ---------------------------------- */
  const handleUnlist = async () => {
    try {
      await axios.patch(`/api/content/${id}`, { type: 'unlist' })
      alert('판매 해제 완료')

      setContent({ ...content, listed: false, price: '0' })
    } catch {
      alert('판매 해제 실패')
    }
  }

  /* ---------------------------------
      🛍 구매하기
  ---------------------------------- */
  const handleBuy = async () => {
    try {
      // 🔥 실제 구매 실행
      const success = await buyItem(Number(content.listingId), content.price)
      if (!success) throw new Error('구매 실패')

      // 🔥 메타마스크 주소
      const acc = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const myAddr = acc[0].toLowerCase()

      // 🔥 플랫폼 수수료 = 2%
      const priceNum = Number(content.price)
      const platformFee = priceNum * 0.02

      // 🔥 로열티 계산 (content.royaltyBps 없음 → NFT 컨트랙트에서 가져오기)
      let royaltyAmount = 0
      try {
        const nft = await getContract('NFT')
        const royaltyInfo = await nft.royaltyInfo(
          Number(content.tokenId),
          parseEther(content.price)
        )
        royaltyAmount = Number(royaltyInfo[1]) / 1e18
      } catch {
        royaltyAmount = 0
      }

      // ⭐ 판매해제
      await axios.patch(`/api/content/${id}`, { type: 'unlist' })

      // ⭐ UI 갱신
      setContent((prev: any) => ({
        ...prev,
        listed: false,
        price: '0',
      }))

      // ⭐ 거래 기록 DB 저장 (관리자 통계용)
      await axios.post('/api/tx', {
        listingId: Number(content.listingId),
        tokenId: Number(content.tokenId),
        price: content.price,
        platformFee,
        royaltyAmount,
        seller: content.owner,
        buyer: myAddr,
        timestamp: Date.now(),
        contentId: id,
      })

      alert('구매 성공!')

      // ⭐ 프로필 이동
      router.push(`/profile/${myAddr}?tab=owned`)
    } catch (err: any) {
      console.error(err)
      alert('구매 실패: ' + err.message)
    }
  }

  /* ---------------------------------
      삭제 / 소각
  ---------------------------------- */
  const handleDeleteDB = async () => {
    if (!confirm('정말 DB에서만 삭제?')) return
    try {
      await axios.delete(`/api/content/${id}`)
      router.push('/profile')
    } catch {}
  }

  const handleDeleteBurn = async () => {
    if (!confirm('NFT 소각 + DB 삭제?')) return
    try {
      const nft = await getSignerContract('NFT')
      const tx = await nft.burn(Number(content.tokenId))
      await tx.wait()

      await axios.delete(`/api/content/${id}`)
      router.push('/profile')
    } catch (err) {
      alert('소각 실패')
    }
  }

  if (!content)
    return <p className="text-center mt-20 text-gray-500">불러오는 중...</p>

  const isMine =
    address && nftOwner && address.toLowerCase() === nftOwner.toLowerCase()

  const isForSale = content.listed && parseFloat(content.price) > 0

  const imageSrc = ipfsToGateway(content.thumbnail || content.ipfsHash || '')

  return (
    <section className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      {/* 이미지 */}
      <div className="flex justify-center mb-6">
        <img
          src={imageSrc}
          className="w-64 h-64 object-contain rounded-xl bg-gray-100"
        />
      </div>

      <h1 className="text-2xl font-bold text-center">{content.title}</h1>
      <p className="text-center text-gray-600 mb-4">{content.description}</p>

      <div className="text-center text-sm space-y-1">
        <p>업로더: {uploaderName || shortenAddress(uploader)}</p>
        <p>소유자: {ownerName || shortenAddress(nftOwner)}</p>
        <p>조회수: {content.views}</p>
        <p>좋아요: {likes}</p>
        <p>{formatDate(content.createdAt)}</p>
      </div>

      {/* 버튼들 */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {/* 좋아요 */}
        <button
          onClick={handleLike}
          className={`px-4 py-2 text-white rounded ${
            isLiked ? 'bg-pink-500' : 'bg-gray-400'
          }`}
        >
          {isLiked ? '💖 좋아요 취소' : '🤍 좋아요'}
        </button>

        {/* 판매자 메뉴 */}
        {isMine && (
          <>
            {/* 삭제 */}
            <div className="w-full bg-red-50 border p-4 rounded mt-4">
              <h2 className="font-bold mb-3 text-red-600">🗑 삭제 메뉴</h2>
              <button
                onClick={handleDeleteDB}
                className="bg-red-500 text-white px-4 py-2 rounded w-full mb-2"
              >
                DB에서만 삭제
              </button>

              <button
                onClick={handleDeleteBurn}
                className="bg-red-700 text-white px-4 py-2 rounded w-full"
              >
                🔥 NFT 소각 + DB삭제
              </button>
            </div>

            {/* 판매 관리 */}
            <div className="w-full bg-gray-50 p-4 rounded border mt-4">
              <h2 className="font-semibold mb-3">🛒 판매 관리</h2>

              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="가격 (ETH)"
                className="w-full border p-2 rounded mb-3"
              />

              {!content.listed && (
                <button
                  onClick={handleList}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  🔥 판매 등록
                </button>
              )}

              {content.listed && (
                <div className="flex gap-3">
                  <button
                    onClick={handleUnlist}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    🛑 판매 해제
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* 구매 UI */}
        {!isMine && isForSale && (
          <button
            onClick={handleBuy}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            💰 {content.price} ETH에 구매하기
          </button>
        )}
      </div>
    </section>
  )
}
