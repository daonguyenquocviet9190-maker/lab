import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import LayoutHeader from '../components/LayoutHeader'
import ProductDetailAddToCartEnhancer from '../components/ProductDetailAddToCartEnhancer'
import SiteFooter from '../components/SiteFooter'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Mykingdom',
  description: 'Mykingdom - Đồ chơi & Quà tặng cao cấp chính hãng',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
        }}
      >
        <LayoutHeader />
        <ProductDetailAddToCartEnhancer />
        <main style={{ flex: 1 }}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
