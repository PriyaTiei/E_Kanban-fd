"use client"
import { createContext, useContext, useState } from "react"

interface SidebarContextType {
  visible: boolean
  toggle: () => void
  setVisible: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true)
  const toggle = () => setVisible((v) => !v)
  return (
    <SidebarContext.Provider value={{ visible, toggle, setVisible }}>
        <div
            className={`transition-all duration-300 ease-in-out 
               pl-0 ${visible ? "sm:pl-12" : "sm:pl-0"} md:pl-0
            `}
        >
            {children}
        </div>
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}