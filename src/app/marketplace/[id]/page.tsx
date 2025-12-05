'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { buyItem } from '../../lib/marketplaceActions';

export default function MarketDetail({ params }: { params: { id: string } }) {
  const listingId = Number(params.id);
  const [item, setItem] = useState<any>(null);

  // 📌 listingId로 DB에서 판매 정보 가져오기
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/api/marketplace/${listingId}`);
        setItem(res.data);
      } catch (err) {
        console.error('로드 오류:', err);
      }
    };
    load();
  }, [listingId]);

  const handleBuy = async () => {
    if (!item) return;

    try {
      await buyItem(listingId, item.price);
      alert('구매 성공!');
    } catch (err: any) {
      alert(`구매 실패: ${err.message}`);
    }
  };

  if (!item)
    return <p className="text-center mt-10 text-gray-500">불러오는 중...</p>;

  return (
    <section className="max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">
        NFT #{item.tokenId} (Listing #{listingId})
      </h1>

      <p className="text-gray-700 mb-4">가격: {item.price} ETH</p>

      <button
        onClick={handleBuy}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        구매하기
      </button>
    </section>
  );
}
