"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminRoyaltyPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/royalty/logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <section className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">💰 로열티 정산 내역</h1>

      <table className="w-full text-sm bg-white rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Token ID</th>
            <th className="p-2 text-left">수취자</th>
            <th className="p-2 text-left">금액 (wei)</th>
            <th className="p-2 text-left">트랜잭션</th>
            <th className="p-2 text-left">날짜</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id} className="border-t hover:bg-gray-50">
              <td className="p-2">{log.tokenId}</td>
              <td className="p-2">{log.royaltyReceiver}</td>
              <td className="p-2">{log.royaltyAmount}</td>
              <td className="p-2">
                <a
                  href={`https://sepolia.etherscan.io/tx/${log.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {log.txHash.slice(0, 10)}...
                </a>
              </td>
              <td className="p-2">
                {new Date(log.timestamp).toLocaleString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
