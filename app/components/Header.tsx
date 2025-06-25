"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, Settings } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function Header() {
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            // Scrolling down
            setShowHeader(false)
          } else {
            // Scrolling up
            setShowHeader(true)
          }
          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Production Line", icon: Factory },
    { href: "/preparation-list", label: "Preparation List", icon: Package },
    { href: "/supply-list", label: "Supply List", icon: Forklift },
    // { href: "/kanban-logs", label: "Kanban Logs", icon: History },
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

  return (
    <header
      className={`sm:hidden md:block bg-gray-800 border-b border-gray-700 sticky top-0 z-50
        transition-transform duration-300 ease-in-out ${showHeader ? "translate-y-0" : "-translate-y-full"}
      `}
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <div className="flex items-center space-x-1">
            <Image
              src="/images/Tiei_logo.png"
              alt="TIEI logo"
              width={90}
              height={28}
              className="h-20 w-auto object-cover object-left"
              priority
            />
            <h1 className="hidden lg:inline text-xl font-bold text-white tracking-wide">E-Kanban System</h1>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <nav className="flex space-x-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      pathname === href ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden text-sm md:inline">{label}</span>
                  </Link>
                ))}
              </nav>
            )}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="border border-gray-600 rounded-full flex items-center space-x-2 text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden xl:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                  <DropdownMenuLabel className="text-gray-300">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className={`text-xs ${getRoleColor(user.role)} capitalize`}>{user.role}</p>
                      {user.plantName && <p className="text-xs text-gray-400">Plant: {user.plantName}</p>}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/edit-stations")}
                        className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Edit Stations</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
