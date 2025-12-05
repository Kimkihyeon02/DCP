'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useWalletUser } from '../../hooks/useWalletUser'
import { useRouter } from 'next/navigation' // ✅ 추가

export default function ProfileSettings() {
  const router = useRouter() // ✅ 추가
  const { address, connect } = useWalletUser()
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      if (!address) return
      const res = await axios.post('/api/auth/wallet', { address })
      if (res.data.user) {
        setNickname(res.data.user.nickname || '')
        setBio(res.data.user.bio || '')
        setPreview(res.data.user.avatar || '')
      }
    }
    loadUser()
  }, [address])

  const handleSave = async () => {
    if (!address) {
      await connect()
      return
    }

    try {
      setSaving(true)
      let avatarUrl = preview

      // 🖼️ IPFS 이미지 업로드
      if (avatar) {
        const form = new FormData()
        form.append('file', avatar)
        const res = await axios.post('/api/ipfs', form)
        avatarUrl = `https://ipfs.io/ipfs/${res.data.IpfsHash}`
      }

      // 🔄 DB 업데이트
      const res = await axios.post('/api/user/update', {
        address,
        nickname,
        bio,
        avatar: avatarUrl,
      })

      if (res.data.success) {
        alert('✅ 프로필이 성공적으로 저장되었습니다!')

        // ✅ 여기서 프로필 페이지로 이동
        router.push(`/profile/${address}`)
        // 필요하면 새 데이터 강제 새로고침
        // router.refresh();
      }
    } catch (err: any) {
      alert('❌ 저장 실패: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto mt-10 bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">⚙️ 프로필 설정</h1>

      {!address ? (
        <p className="text-gray-600 mb-4">MetaMask 지갑을 연결해야 합니다.</p>
      ) : (
        <p className="text-sm text-gray-500 mb-4 break-all">
          연결된 지갑: {address}
        </p>
      )}

      <div className="space-y-4">
        {preview && (
          <img
            src={preview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover mx-auto mb-2"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setAvatar(file)
              setPreview(URL.createObjectURL(file))
            }
          }}
        />

        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <textarea
          placeholder="자기소개 (최대 200자)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          className="w-full p-2 border rounded h-24"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className={`w-full py-3 text-white rounded ${
            saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </section>
  )
}
