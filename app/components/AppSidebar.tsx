"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, History, Settings, Timer } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SidebarCollapseButton from "./AppSidebarCollapseBtn"
import { useSidebar } from "../contexts/SideBarContext"
import { useEffect } from "react"
import UserMenu from "./UserMenu"

function CustomSidebar({ visible = true }: { visible?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const navItems = [
    { href: "/", label: "Production Line", icon: Factory },
    { href: "/preparation-list", label: "Preparation List", icon: Package },
    { href: "/supply-list", label: "Supply List", icon: Forklift },
    { href: "/delay-list", label: "Delay List", icon: Timer },
    { href: "/kanban-logs", label: "Kanban Logs", icon: History },
    // ...(user?.role === "admin" ? [{ href: "/settings", label: "Settings", icon: Settings }] : []),
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

  if (!user || !visible) return null

  return (
    <aside
      className={`
        hidden md:hidden landscape:max-md:flex overflow-y-auto no-scrollbar
        fixed top-0 left-0 z-40 h-full w-fit
        bg-gray-800 border-r border-gray-700 
        flex-col items-center 
        transition-transform duration-300 ease-in-out
        ${visible ? "translate-x-0 visible" : "-translate-x-full invisible"}
      `}
    >
      {/* Content */}
      <div className="px-2 pt-16 flex-1 flex flex-col w-full">
        {/* Navigation */}
        <div className="h-full max-h-60 flex flex-col items-center justify-between gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <div key={href} className="">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-full p-2 rounded ${
                        pathname === href
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Link href={href} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        {/* {state === "expanded" && <span className="text-sm">{label}</span>} */}
                      </Link>
                    </div>
                  </TooltipTrigger>
                  {/* {state === "collapsed" && ( */}
                  <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                    {label}
                  </TooltipContent>
                  {/* )} */}
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-2 justify-self-end">
        <UserMenu/>
      </div>
    </aside>
  )
}

export default function AppSidebar() {
  const { visible, setVisible, toggle } = useSidebar()
  const { user } = useAuth()

  useEffect(() => {
    // If user is not logged in, hide sidebar and do not render anything
    if (!user && visible) {
      setVisible(false)
    }
  }, [user, visible, setVisible])

  if (!user) {
    return null
  }

  return (
    <div>
      {/* Collapse button (only on sm screens) */}
      <SidebarCollapseButton onClick={toggle} />
      {/* Sidebar (only on sm screens) */}
      <CustomSidebar visible={visible} />
    </div>
  )
}
