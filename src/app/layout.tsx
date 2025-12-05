import './globals.css'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'

export const metadata = {
  title: 'Decentralized Content Platform',
  description: 'Web3 기반 콘텐츠 소유권 관리 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="min-h-full">
      <body
        suppressHydrationWarning
        className="bg-pink-100 text-gray-900 min-h-screen flex flex-col"
        style={{ fontFamily: 'Gulim, 굴림, sans-serif' }}
      >
        <Header />

        <main className="container mx-auto p-6 flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  )
}
