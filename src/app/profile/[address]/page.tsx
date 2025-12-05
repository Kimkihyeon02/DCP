'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ipfsToGateway, formatDate } from '../../lib/utils'
import { getSignerContract } from '../../lib/contract'
import DeleteModal from '../../components/ui/DeleteModal'
import { getReadContract } from '../../lib/contract'

type TabType = 'uploaded' | 'liked' | 'owned'

export default function ProfilePage() {
  // @ts-ignore
  const { address } = useParams()
  const wallet = String(address || '').toLowerCase()

  const [tab, setTab] = useState<TabType>('uploaded')
  const [list, setList] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 삭제 모달
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const openDeleteModal = (item: any) => {
    setSelectedItem(item)
    setModalOpen(true)
  }

  const closeDeleteModal = () => {
    setSelectedItem(null)
    setModalOpen(false)
  }

  // ======================== 사용자 정보 ========================
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`/api/auth/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: wallet }),
      })

      const data = await res.json()
      if (data.user) setUser(data.user)
    } catch (err) {
      console.error('사용자 정보 불러오기 실패:', err)
    }
  }

  // ======================== 업로드 콘텐츠 ========================
  const fetchUploaded = async () => {
    try {
      const res = await fetch(`/api/content?owner=${wallet}`)
      const json = await res.json()
      setList(json.data || [])
    } catch (err) {
      console.error('업로드 콘텐츠 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  // ======================== 좋아요한 콘텐츠 ========================
  const fetchLiked = async () => {
    try {
      const res = await fetch(`/api/content`)
      const json = await res.json()

      const all = json.data || []
      const liked = all.filter((i: any) =>
        i.likedBy?.map((v: string) => v.toLowerCase()).includes(wallet)
      )

      setList(liked)
    } catch (err) {
      console.error('좋아요 콘텐츠 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  // ======================== 온체인 소유 콘텐츠 ========================
  const fetchOwned = async () => {
    try {
      const res = await fetch(`/api/content`)
      const json = await res.json()
      const all = json.data || []

      const nft = getReadContract('NFT')
      const owned: any[] = []

      for (const item of all) {
        if (!item.tokenId) continue

        try {
          const owner = await nft.ownerOf(Number(item.tokenId))
          if (owner.toLowerCase() === wallet) owned.push(item)
        } catch (err) {
          console.warn(`ownerOf 실패 item=${item._id}`)
        }
      }

      setList(owned)
    } catch (err) {
      console.error('온체인 소유 콘텐츠 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  // ======================== 탭 변경 시 각 함수 실행 ========================
  useEffect(() => {
    setLoading(true)

    if (tab === 'uploaded') fetchUploaded()
    else if (tab === 'liked') fetchLiked()
    else fetchOwned()
  }, [tab, wallet])

  useEffect(() => {
    fetchUserInfo()
  }, [wallet])

  // ======================== DB 삭제 ========================
  const handleDBDelete = async () => {
    if (!selectedItem) return

    try {
      const res = await fetch(`/api/content/${selectedItem._id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('DB 삭제 실패')

      alert('DB에서 삭제 완료!')
      setList((prev) => prev.filter((i) => i._id !== selectedItem._id))

      closeDeleteModal()
    } catch (err) {
      console.error('DB 삭제 오류:', err)
    }
  }

  // ======================== NFT 소각 + DB 삭제 ========================
  const handleBurnDelete = async () => {
    if (!selectedItem) return

    try {
      if (!selectedItem.tokenId) {
        alert('NFT tokenId가 없습니다.')
        return
      }

      const nft = await getSignerContract('NFT')
      const tx = await nft.burn(selectedItem.tokenId)
      await tx.wait()

      await fetch(`/api/content/${selectedItem._id}`, {
        method: 'DELETE',
      })

      alert('NFT 소각 + DB 삭제 완료!')
      setList((prev) => prev.filter((i) => i._id !== selectedItem._id))

      closeDeleteModal()
    } catch (err) {
      console.error('소각 오류:', err)
      alert('NFT 소각 실패')
    }
  }

  // ======================== 로딩 ========================
  if (loading)
    return <p className="text-center mt-20 text-gray-500">불러오는 중...</p>

  // ======================== avatar 안전 처리 ========================
  const avatarUrl =
    user?.avatar && user.avatar.trim() !== ''
      ? user.avatar
      : 'https://avatars.githubusercontent.com/u/9919?s=200&v=4'

  return (
    <section className="max-w-6xl mx-auto mt-10 px-4">
      {/* 삭제 모달 */}
      <DeleteModal
        open={modalOpen}
        onClose={closeDeleteModal}
        onDBDelete={handleDBDelete}
        onBurnDelete={handleBurnDelete}
      />

      {/* ================= 프로필 정보 ================= */}
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <img
          src={avatarUrl}
          alt="프로필 이미지"
          className="w-24 h-24 rounded-full border object-cover"
        />

        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {user?.nickname || '익명 사용자'}
          </h1>

          <p className="text-gray-500 text-sm break-all">{wallet}</p>

          {user?.bio && (
            <p className="text-gray-600 text-sm italic mt-1">“{user.bio}”</p>
          )}
        </div>

        <Link
          href="/profile/settings"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          ⚙️ 프로필 수정
        </Link>
      </div>

      {/* ================= 탭 ================= */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setTab('uploaded')}
          className={`px-4 py-2 rounded ${
            tab === 'uploaded'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          📤 업로드한 콘텐츠
        </button>

        <button
          onClick={() => setTab('owned')}
          className={`px-4 py-2 rounded ${
            tab === 'owned'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          🧩 내 NFT
        </button>

        <button
          onClick={() => setTab('liked')}
          className={`px-4 py-2 rounded ${
            tab === 'liked'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          ❤️ 좋아요한 콘텐츠
        </button>
      </div>

      {/* ================= 콘텐츠 목록 ================= */}
      <div className="grid md:grid-cols-3 gap-6">
        {list.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center mt-10">
            {tab === 'uploaded'
              ? '아직 업로드한 콘텐츠가 없습니다.'
              : tab === 'owned'
              ? '보유 중인 NFT가 없습니다.'
              : '좋아요한 콘텐츠가 없습니다.'}
          </p>
        ) : (
          list.map((item) => {
            const thumbnailUrl = item.thumbnail?.trim()
              ? ipfsToGateway(item.thumbnail)
              : ipfsToGateway(item.ipfsHash || '')

            return (
              <div
                key={item._id}
                className="bg-white border rounded-lg p-3 shadow hover:shadow-md transition"
              >
                <Link href={`/content/${item._id}`}>
                  <img
                    src={thumbnailUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover rounded"
                  />
                </Link>

                <h3 className="font-semibold mt-3 truncate">{item.title}</h3>
                <p className="text-gray-500 text-sm">
                  ❤️ {item.likes} · 👁 {item.views}
                </p>

                <p className="text-xs text-gray-400 mb-3">
                  {formatDate(item.createdAt)}
                </p>

                <div className="flex gap-2">
                  <Link
                    href={`/content/${item._id}`}
                    className="flex-1 bg-blue-500 text-white text-sm px-3 py-2 rounded text-center"
                  >
                    🛒 판매 관리
                  </Link>

                  <button
                    onClick={() => openDeleteModal(item)}
                    className="flex-1 bg-red-500 text-white text-sm px-3 py-2 rounded"
                  >
                    🗑 삭제
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
