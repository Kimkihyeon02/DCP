"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function AdminStats() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/content").then((res) => setData(res.data));
  }, []);

  const chartData = {
    labels: data.map((d) => d.title),
    datasets: [
      {
        label: "조회수",
        data: data.map((d) => d.views),
      },
    ],
  };

  return (
    <section className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">📊 콘텐츠 통계</h1>
      <Bar data={chartData} />
    </section>
  );
}
