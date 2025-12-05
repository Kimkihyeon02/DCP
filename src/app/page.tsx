'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { ContentCard } from './content/ContentCard'

export default function Home() {
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const res = await axios.get('/api/content')
        const data = Array.isArray(res.data) ? res.data : res.data?.data || []
        setContents(data)
      } catch (err) {
        console.error('❌ 콘텐츠 불러오기 오류:', err)
        setContents([])
      } finally {
        setLoading(false)
      }
    }
    fetchContents()
  }, [])

  return (
    <main
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px 64px',
      }}
    >
      {/* 헤더 영역 */}
      <header
        style={{
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
            letterSpacing: '0.04em',
          }}
        >
          <span>Trending Now</span>
        </h1>

        {/* 밑줄 포인트 */}
        <div
          style={{
            width: 80,
            height: 3,
            borderRadius: 999,
            backgroundColor: '#ddd', // 기존 계열의 회색만 사용
            marginTop: 10,
            marginBottom: 12,
          }}
        />

        {/* 짧은 설명 문구 */}
        <p
          style={{
            fontSize: 14,
            color: '#777',
          }}
        >
          지금 가장 많이 주목받는 디지털 콘텐츠들을 한눈에 모아봤어요.
        </p>
      </header>

      {/* 콘텐츠 목록 */}
      {loading ? (
        <p
          style={{
            textAlign: 'center',
            color: '#777',
            marginTop: 80,
            fontSize: 15,
          }}
        >
          불러오는 중...
        </p>
      ) : contents.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#777',
            marginTop: 96,
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 600 }}>
            등록된 콘텐츠가 없습니다.
          </p>
          <p style={{ fontSize: 13, marginTop: 8, color: '#aaa' }}>
            첫 번째 NFT를 업로드해보세요!
          </p>
        </div>
      ) : (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}
        >
          {contents.map((c) => (
            <div
              key={c._id}
              style={{
                maxWidth: 260,
                margin: '0 auto',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
              }}
              // 간단한 hover 효과 (색은 안 건드리고 그림자만)
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform =
                  'translateY(-4px)'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow =
                  '0 10px 20px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
              }}
            >
              <ContentCard content={c} />
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
