"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function AdminStats() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/content?sort=views");
        setData(res.data);
      } catch (err) {
        console.error("통계 데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">통계 데이터를 불러오는 중...</p>;

  // 상위 10개 기준으로 시각화
  const top10 = data.slice(0, 10);
  const chartData = {
    labels: top10.map((d) => d.title.length > 15 ? d.title.slice(0, 15) + "..." : d.title),
    datasets: [
      {
        label: "조회수 👁️",
        data: top10.map((d) => d.views),
        backgroundColor: "rgba(59, 130, 246, 0.7)", // 파란색
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "좋아요 ❤️",
        data: top10.map((d) => d.likes),
        backgroundColor: "rgba(239, 68, 68, 0.7)", // 빨간색
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "상위 10개 콘텐츠 조회수 / 좋아요 비교",
      },
    },
    scales: {
      x: {
        ticks: { color: "#4b5563" },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#4b5563" },
      },
    },
  };

  return (
    <section className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">📊 콘텐츠 통계</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar data={chartData} options={options} />
      </div>
    </section>
  );
}
