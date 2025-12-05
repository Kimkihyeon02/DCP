'use client'

import { useState } from 'react'
import { getSignerContract, getContract } from '../lib/contract'
import { ethers } from 'ethers'

export default function DebugPage() {
  const [tokenId, setTokenId] = useState('')
  const [listingId, setListingId] = useState('')
  const [wallet, setWallet] = useState('')
  const [result, setResult] = useState('')

  const MARKET = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!

  const replacer = (key: any, value: any) =>
    typeof value === 'bigint' ? value.toString() : value

  /* --------------------------------------
     ownerOf(tokenId)
  -------------------------------------- */
  const checkOwner = async () => {
    try {
      const nft = await getContract('NFT')
      const owner = await nft.ownerOf(Number(tokenId))
      setResult(`ownerOf(${tokenId}) = ${owner}`)
    } catch (err: any) {
      setResult(err.message)
    }
  }

  /* --------------------------------------
     listings(listingId)
  -------------------------------------- */
  const checkListing = async () => {
    try {
      const market = await getContract('Marketplace')
      const raw = await market.listings(Number(listingId))

      const formatted = {
        nft: raw[0],
        tokenId: raw[1].toString(),
        seller: raw[2],
        price: ethers.formatEther(raw[3]),
        active: raw[4],
      }

      setResult(JSON.stringify(formatted, null, 2))
    } catch (err: any) {
      setResult(err.message)
    }
  }

  /* --------------------------------------
     listingCount()
  -------------------------------------- */
  const checkListingCount = async () => {
    try {
      const market = await getContract('Marketplace')
      const count = await market.listingCount()
      setResult(`listingCount = ${count.toString()}`)
    } catch (err: any) {
      setResult(err.message)
    }
  }

  /* --------------------------------------
     isApprovedForAll(seller → MARKET)
  -------------------------------------- */
  const checkApproval = async () => {
    try {
      const nft = await getContract('NFT')
      const approved = await nft.isApprovedForAll(wallet, MARKET)

      setResult(
        `isApprovedForAll(\n  owner: ${wallet},\n  operator: ${MARKET}\n) = ${approved}`
      )
    } catch (err: any) {
      setResult(err.message)
    }
  }

  /* --------------------------------------
     잔액(balanceOf)
  -------------------------------------- */
  /* --------------------------------------
   balanceOf(wallet)
-------------------------------------- */
const checkBalance = async () => {
  try {
    const nft = await getContract("NFT");

    const bal = await nft.balanceOf(wallet);
    setResult(`balanceOf(${wallet}) = ${bal.toString()}`);
  } catch (err: any) {
    setResult(err.message);
  }
};


  /* --------------------------------------
     UI
  -------------------------------------- */
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>

      {/* ownerOf */}
      <div>
        <h2 className="font-semibold">ownerOf()</h2>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="border p-2 mr-2"
          placeholder="tokenId"
        />
        <button onClick={checkOwner} className="bg-blue-600 text-white px-4 py-2 rounded">
          확인
        </button>
      </div>

      {/* listings */}
      <div>
        <h2 className="font-semibold">listings()</h2>
        <input
          type="number"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          className="border p-2 mr-2"
          placeholder="listingId"
        />
        <button onClick={checkListing} className="bg-green-600 text-white px-4 py-2 rounded">
          확인
        </button>
      </div>

      {/* listingCount */}
      <div>
        <h2 className="font-semibold">listingCount()</h2>
        <button
          onClick={checkListingCount}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          조회
        </button>
      </div>

      {/* Approval Check */}
      <div>
        <h2 className="font-semibold">isApprovedForAll(owner → MARKET)</h2>
        <input
          type="text"
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className="border p-2 mr-2 w-[350px]"
          placeholder="owner wallet address"
        />
        <button
          onClick={checkApproval}
          className="bg-yellow-600 text-white px-4 py-2 rounded"
        >
          확인
        </button>
      </div>

      {/* balanceOf(wallet) */}
<div>
  <h2 className="font-semibold">balanceOf(wallet)</h2>
  <input
    type="text"
    value={wallet}
    onChange={(e) => setWallet(e.target.value)}
    className="border p-2 mr-2"
    placeholder="0x1234..."
  />
  <button onClick={checkBalance} className="bg-red-600 text-white px-4 py-2 rounded">
    조회
  </button>
</div>


      {/* 출력 */}
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {result}
      </pre>
    </div>
  )
}
