'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ipfsToGateway } from '../lib/utils'

type SearchItem = {
  _id: string
  title: string
  description?: string
  owner: string
  thumbnail?: string
  ipfsHash?: string
  views?: number
  likes?: number
}

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [q])

  return (
    <section className="max-w-5xl mx-auto mt-10 pb-16 px-4">
      <h1 className="text-2xl font-bold mb-6">🔍 검색 결과: “{q}”</h1>

      {loading ? (
        <p className="text-gray-500">검색 중...</p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {results.map((r) => (
            <Link
              key={r._id}
              href={`/content/${r._id}`}
              className="bg-white border rounded-lg shadow hover:shadow-md transition p-3 max-w-[260px] mx-auto"
            >
              <div className="w-full aspect-[4/3] overflow-hidden rounded mb-3">
                <img
                  src={
                    ipfsToGateway(r.thumbnail || r.ipfsHash) ||
                    '/images/default-thumbnail.png'
                  }
                  alt={r.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-semibold truncate mb-1">{r.title}</h3>

              {r.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                  {r.description}
                </p>
              )}

              <p className="text-xs text-gray-400">
                👁️ {r.views ?? 0} · ❤️ {r.likes ?? 0}
              </p>

              <p className="text-[11px] text-gray-400 mt-1 break-all">
                작성자: {r.owner}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
