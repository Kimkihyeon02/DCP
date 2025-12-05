import { Suspense } from 'react'
import SearchPageClient from './searchpageclient'

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-5xl mx-auto mt-10 pb-16 px-4">
          <p className="text-gray-500">검색 중...</p>
        </section>
      }
    >
      <SearchPageClient />
    </Suspense>
  )
}
