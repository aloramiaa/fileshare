import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/toaster"
import { SettingsProvider } from "@/contexts/settings-context"
import { MetaUpdater } from "@/components/meta"
import { ScrollToTop } from "@/components/scroll-to-top"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FILESHARE - SECURE FILE SHARING",
  description: "Fast, secure, and encrypted file sharing for the digital age",
  openGraph: {
    title: "FILESHARE - SECURE FILE SHARING",
    description: "Fast, secure, and encrypted file sharing for the digital age",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FILESHARE - SECURE FILE SHARING",
    description: "Fast, secure, and encrypted file sharing for the digital age",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col digital-noise`}>
        <SettingsProvider>
          <MetaUpdater />
          <div className="fixed top-0 left-0 w-full h-1 bg-[rgba(var(--toxic-red-rgb),0.7)] z-50 warning-flash"></div>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <ScrollToTop />
          <div className="fixed bottom-0 left-0 w-full h-1 bg-[rgba(var(--toxic-red-rgb),0.7)] z-50 warning-flash"></div>
        </SettingsProvider>
      </body>
    </html>
  )
}


import './globals.css'