import mongoose, { ConnectOptions } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI 환경 변수가 설정되지 않았습니다.')
}

// ✅ 글로벌 캐시 (Next.js 핫 리로드 시에도 연결 유지)
let cached = (global as any)._mongooseCache

if (!cached) {
  cached = (global as any)._mongooseCache = { conn: null, promise: null }
}

export async function connectDB() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    console.log('🌐 MongoDB 연결 시도 중...')

    const opts: ConnectOptions = {
      dbName: 'content', // ← 실제 DB 이름 지정 (선택)
      maxPoolSize: 10, // 연결 풀 크기 제한
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB 연결 성공')
        return mongoose
      })
      .catch((err) => {
        console.error('❌ MongoDB 연결 실패:', err)
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
