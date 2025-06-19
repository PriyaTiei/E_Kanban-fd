import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/Header"
import MobileSidebar from "./components/MobileSidebar"
import Footer from "./components/Footer"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "./components/AuthWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-Kanban System",
  description: "Production line management and kanban tracking system",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}>
        <AuthProvider>
          <AuthWrapper>
            <Header />
            <MobileSidebar />
            <main className="flex-1 pt-0 md:pt-0">{children}</main>
            <Footer />
          </AuthWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
