"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Factory, Forklift, Package, User, LogOut, History } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { logoutUser } from "../lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const { state } = useSidebar()

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

  if (!user) return null

  return (
    <Sidebar className="border-r border-gray-700 bg-gray-800" collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {state === "expanded" ? (
            <div className="flex items-center space-x-2">
              <Image
                src="/images/Tiei_logo.png"
                alt="TIEI logo"
                width={32}
                height={32}
                className="h-8 w-auto object-cover object-left"
                priority
              />
              <span className="text-sm font-bold text-white">E-Kanban</span>
            </div>
          ) : (
            <Image
              src="/images/Tiei_logo.png"
              alt="TIEI logo"
              width={24}
              height={24}
              className="h-6 w-auto object-cover object-left mx-auto"
              priority
            />
          )}
          <SidebarTrigger className="text-gray-400 hover:text-white" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* User Info */}
        {state === "expanded" && (
          <div className="mb-4 p-2 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.username}</p>
                <p className={`text-xs ${getRoleColor(user.role)} capitalize`}>{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarMenu>
          {navItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === href}
                      className={`w-full ${
                        pathname === href
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <Link href={href} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        {state === "expanded" && <span className="text-sm">{label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {state === "collapsed" && (
                    <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                      {label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={handleLogout}
                    className="w-full text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut className="h-5 w-5" />
                    {state === "expanded" && <span className="text-sm">Log out</span>}
                  </SidebarMenuButton>
                </TooltipTrigger>
                {state === "collapsed" && (
                  <TooltipContent side="right" className="bg-gray-700 text-white border-gray-600">
                    Log out
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
