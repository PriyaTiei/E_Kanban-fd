"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, History, Settings } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../lib/api"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import SidebarCollapseButton from "./AppSidebarCollapseBtn"
import { useSidebar } from "../contexts/SideBarContext"

function CustomSidebar({ visible = true }: { visible?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const navItems = [
    { href: "/", label: "Production Line", icon: Factory },
    { href: "/preparation-list", label: "Preparation List", icon: Package },
    { href: "/supply-list", label: "Supply List", icon: Forklift },
    { href: "/kanban-logs", label: "Kanban Logs", icon: History },
    ...(user?.role === "admin" ? [{ href: "/edit-stations", label: "Edit Stations", icon: Settings }] : []),
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
      className={`fixed top-0 left-0 z-40 h-full w-fit bg-gray-800 border-r border-gray-700 flex-col items-center hidden sm:flex md:hidden
        transition-transform duration-300 ease-in-out
        ${visible ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* <div className="p-4 flex items-center justify-between">
          <Image
            src="/images/Tiei_logo.png"
            alt="TIEI logo"
            width={24}
            height={24}
            className="h-6 w-auto object-cover object-left mx-auto"
            priority
          />
        </div> */}

      {/* Content */}
      <div className="px-2 flex-1 flex flex-col justify-center w-full">
        {/* User Info */}
        {/* <div className="my-8">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-300" />
          </div>
          <hr className="my-2 border-gray-700" />
        </div> */}

        {/* Navigation */}
        <div className="flex flex-col items-center gap-2">
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
        <div className="mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-gray-300">
                  <User className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                <div className="text-xs">
                  <p className="font-medium">{user.username}</p>
                  <p className={`${getRoleColor(user.role)} capitalize`}>{user.role}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
                {/* {state === "expanded" && <span className="text-sm">Log out</span>} */}
              </button>
            </TooltipTrigger>
            {/* {state === "collapsed" && ( */}
            <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
              Log out
            </TooltipContent>
            {/* )} */}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  )
}

export default function AppSidebar() {
  const { visible, toggle } = useSidebar()

  return (
    <div>
      {/* Collapse button (only on sm screens) */}
      <SidebarCollapseButton onClick={toggle} />
      {/* Sidebar (only on sm screens) */}
      <CustomSidebar visible={visible} />
    </div>
  )
}
