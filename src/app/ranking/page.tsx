"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ipfsToGateway } from "../lib/utils";

export default function RankingPage() {
  const [tab, setTab] = useState<"views" | "likes">("views");
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/ranking?sort=${tab}`);
        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error("랭킹 데이터 로드 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tab]);

  return (
    <section className="max-w-5xl mx-auto mt-10">
      <div className="flex gap-4 mb-6 justify-center">
        <button
          onClick={() => setTab("views")}
          className={`px-4 py-2 rounded ${
            tab === "views" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          👁️ 조회수 순
        </button>
        <button
          onClick={() => setTab("likes")}
          className={`px-4 py-2 rounded ${
            tab === "likes" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          ❤️ 좋아요 순
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">불러오는 중...</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {list.map((item, idx) => (
            <Link
              key={item._id}
              href={`/content/${item._id}`}
              className="bg-white border rounded-lg shadow hover:shadow-md transition p-3"
            >
              <img
                src={ipfsToGateway(item.thumbnail || item.ipfsHash)}
                alt={item.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="font-semibold truncate">
                #{idx + 1} {item.title}
              </h3>
              <p className="text-sm text-gray-500">
                👁️ {item.views} · ❤️ {item.likes}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
