"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Factory, Forklift, KanbanSquare, Package } from "lucide-react"

export default function Header() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Production Line", icon: Factory },
    { href: "/preparation-list", label: "Preparation List", icon: Package },
    { href: "/supply-list", label: "Supply List", icon: Forklift },
  ]

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <KanbanSquare className="h-8 w-8 text-blue-500" />
            <h1 className="text-xl font-bold text-white">E-Kanban System</h1>
          </div>

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
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
