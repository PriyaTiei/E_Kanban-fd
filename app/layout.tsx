import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./app.css"
import "../styles/globals.css"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "./components/AuthWrapper"
import AppSidebar from "./components/AppSidebar"
import { SidebarProvider } from "./contexts/SideBarContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "E-Kanban System",
  description: "Kanban management and tracking system",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <AuthProvider>
          <AuthWrapper>
            <Header />
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1 min-h-screen">{children}</main>
            </SidebarProvider>
            <Footer />
          </AuthWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
