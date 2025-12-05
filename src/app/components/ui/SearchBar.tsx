'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-xl mx-auto mt-6">
      <input
        type="text"
        placeholder="콘텐츠 제목, 설명, 작성자 검색..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
      >
        검색
      </button>
    </form>
  );
}
