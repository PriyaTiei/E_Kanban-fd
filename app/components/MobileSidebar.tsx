"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, History, Menu } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

export default function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const navItems = [
    { href: "/", label: "Production Line", icon: Factory },
    { href: "/preparation-list", label: "Preparation List", icon: Package },
    { href: "/supply-list", label: "Supply List", icon: Forklift },
    { href: "/kanban-logs", label: "Kanban Logs", icon: History },
  ]

  const handleLogout = async () => {
    try {
      await logoutUser()
      logout()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
      router.push("/login")
      setOpen(false)
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "An error occurred during logout",
        variant: "destructive",
      })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400"
      case "logistics":
        return "text-blue-400"
      case "supplier":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  if (!user) return null

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-gray-800 border-gray-700 p-0 overflow-y-auto">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 pb-4">
                    <div className="flex items-center space-x-3">
                      <Image
                        src="/images/Tiei_logo.png"
                        alt="TIEI logo"
                        width={60}
                        height={20}
                        className="h-12 w-auto object-cover object-left"
                        priority
                      />
                      <SheetTitle className="text-white text-lg font-bold">E-Kanban System</SheetTitle>
                    </div>
                  </SheetHeader>

                  <Separator className="bg-gray-700" />

                  {/* User Info */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className={`text-xs ${getRoleColor(user.role)} capitalize`}>{user.role}</p>
                        {user.plantName && <p className="text-xs text-gray-400">Plant: {user.plantName}</p>}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  {/* Navigation */}
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navItems.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                            pathname === href
                              ? "bg-blue-600 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{label}</span>
                        </Link>
                      ))}
                    </div>
                  </nav>

                  <Separator className="bg-gray-700" />

                  {/* Logout Button */}
                  <div className="p-4">
                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-white">E-Kanban</h1>
          </div>
        </div>
      </div>
    </>
  )
}
