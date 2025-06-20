import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./app.css"
import "../styles/globals.css"
import Header from "./components/Header"
import AppSidebar from "./components/AppSidebar"
import Footer from "./components/Footer"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import AuthWrapper from "./components/AuthWrapper"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

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
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        <AuthProvider>
          <AuthWrapper>
            {/* Mobile Layout with Sidebar */}
            <div className="md:hidden">
              <SidebarProvider defaultOpen={true}>
                <AppSidebar />
                <SidebarInset className="flex flex-col min-h-screen">
                  <main className="flex-1 p-4">{children}</main>
                  <Footer />
                </SidebarInset>
              </SidebarProvider>
            </div>

            {/* Desktop Layout with Header */}
            <div className="hidden md:flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthWrapper>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
