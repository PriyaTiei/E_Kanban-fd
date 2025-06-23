"use client"

import { Menu, PanelLeft } from "lucide-react"

export default function SidebarCollapseButton({ onClick,  }: { onClick: () => void }) {
  return (
    <button
      className="fixed top-2 left-2 z-50 hidden sm:block md:hidden bg-gray-800 text-white p-1 rounded-lg shadow"
      onClick={onClick}
      aria-label="Toggle sidebar"
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}