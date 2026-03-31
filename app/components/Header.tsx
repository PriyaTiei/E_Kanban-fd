"use client"

import "../../styles/globals.css"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, Settings, Dot, Timer } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { changePlant, logoutUser } from "../lib/api"
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
import { User as UserType } from "../lib/types"
import UserMenu from "./UserMenu"

export default function Header() {
  const [showHeader, setShowHeader] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

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
    { href: "/delay-list", label: "Delay List", icon: Timer },
  ]

  return (
    // **INCASE SIDEBAR ENABLED ADD:** landscape:max-md:hidden md:block
    <header
      className={` bg-gray-800 border-b border-gray-700 sticky top-0 z-50
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
            <h1 className="hidden md:inline text-xl font-bold text-white tracking-wide">E-Kanban System</h1>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <>
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
                      <span className="hidden text-sm lg:inline">{label}</span>
                    </Link>
                  ))}
                </nav>
              
                <UserMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
