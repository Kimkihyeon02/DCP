'use client'

import { useState } from 'react'
import axios from 'axios'
import { getSignerContract } from '../lib/contract'
import { uploadJSONToIPFS } from '../lib/ipfs'
import { useWallet } from '../hooks/useWallet'
import { useRouter } from 'next/navigation'
import { parseEther } from "ethers";


export default function UploadPage() {
  const router = useRouter()
  const { connect } = useWallet()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [royalty, setRoyalty] = useState(500)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !title) {
      alert('제목과 파일은 필수입니다.')
      return
    }

    try {
      setUploading(true)

      // 1️⃣ 메타마스크 연결
      await connect()

      // 2️⃣ ❗ 지갑주소 직접 로드 (state 절대 사용 금지)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      const realAddress = accounts[0]
      if (!realAddress) throw new Error('지갑 주소 로드 실패')

      // 3️⃣ 파일을 IPFS에 업로드
      const fileForm = new FormData()
      fileForm.append('file', file)

      const ipfsRes = await axios.post('/api/ipfs', fileForm)
      const fileCID = ipfsRes.data.IpfsHash
      const fileURI = `ipfs://${fileCID}`

      // 4️⃣ NFT 메타데이터 생성
      const metadata = {
        name: title,
        description,
        image: fileURI,
        attributes: [
          { trait_type: 'creator', value: realAddress },
          { trait_type: 'royalty', value: `${royalty / 100}%` },
        ],
      }

      // 5️⃣ 메타데이터 IPFS 업로드
      const metaRes = await uploadJSONToIPFS(metadata)
      const metadataURI = `ipfs://${metaRes.IpfsHash}`

      // 6️⃣ NFT 컨트랙트 로드 후 민팅
      const nft = await getSignerContract('NFT')

      const tx = await nft.mint(
  metadataURI,
  royalty,
  title,
  description,
  fileURI,
  {
    value: parseEther("0.001")   // 🔥 업로드 수수료(0.001 ETH)
  }
)

const receipt = await tx.wait()


      // 7️⃣ tokenId 추출
      const event = receipt.logs
        .map((log: any) => {
          try {
            return nft.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((e: any) => e?.name === 'Transfer')

      if (!event) throw new Error('TokenId 추출 실패')

      const tokenId = Number(event.args.tokenId)
      console.log('🎉 민팅된 Token ID:', tokenId)

      // 🔥🔥🔥 8️⃣ Marketplace에 자동 승인 (필수)
      await nft.setApprovalForAll(
        process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!,
        true
      )
      console.log('✅ Marketplace 승인 완료')

      // 9️⃣ DB 저장 (owner = realAddress)
      await axios.post('/api/content', {
        title,
        description,
        ipfsHash: fileCID,
        thumbnail: fileCID,
        owner: realAddress,
        uploader: realAddress,
        category: '기타',
        tokenId,
      })

      alert('✅ 업로드 및 NFT 발행 완료!')
      router.push('/')
    } catch (err: any) {
      console.error('❌ 업로드 실패:', err)
      alert('❌ 업로드 실패: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        콘텐츠 업로드 |•̅ᴗ•̅)ﾉ"
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-xl"
        />

        <textarea
          placeholder="설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-xl h-72"
        />

        <p className="text-gray-600 text-sm bg-gray-100 p-2 rounded">
  업로드 수수료: <span className="font-semibold">0.001 ETH</span>
</p>


        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFile}
          className="border p-2 rounded w-full"
        />

        {file && (
          <p className="text-sm text-gray-600">
            선택된 파일: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className={`w-full py-3 text-white font-semibold rounded transition ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading
            ? '(∩｀-´)⊃━☆ﾟ.*･｡ﾟ 업로드 중입니다...'
            : 'NFT 발행하기 |ʘ‿ʘ)╯ $'}
        </button>
      </div>
    </section>
  )
}
