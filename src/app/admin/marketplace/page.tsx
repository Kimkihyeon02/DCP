"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminMarketEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await axios.get("/api/marketplace/sync"); // 최신 이벤트 싱크
    const res = await axios.get("/api/marketplace/logs");
    setEvents(res.data);
    setLoading(false);
  };

  return (
    <section className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">🛒 마켓플레이스 거래 내역</h1>
      <button
        onClick={fetchData}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "동기화 중..." : "이벤트 새로고침"}
      </button>

      <table className="w-full text-sm bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">타입</th>
            <th className="p-2 text-left">Listing ID</th>
            <th className="p-2 text-left">Token ID</th>
            <th className="p-2 text-left">판매자</th>
            <th className="p-2 text-left">구매자</th>
            <th className="p-2 text-left">가격(wei)</th>
            <th className="p-2 text-left">TX</th>
            <th className="p-2 text-left">날짜</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{e.eventType}</td>
              <td className="p-2">{e.listingId}</td>
              <td className="p-2">{e.tokenId}</td>
              <td className="p-2">{e.seller?.slice(0, 10)}...</td>
              <td className="p-2">{e.buyer?.slice(0, 10) || "-"}</td>
              <td className="p-2">{e.price}</td>
              <td className="p-2">
                <a
                  href={`https://sepolia.etherscan.io/tx/${e.txHash}`}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {e.txHash.slice(0, 10)}...
                </a>
              </td>
              <td className="p-2">
                {new Date(e.timestamp).toLocaleString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
