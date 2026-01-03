"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  placeholder?: string
  defaultValue?: string
  onSearch: (value: string) => void
  debounceMs?: number
  className?: string
}

export default function SearchBar({
  placeholder = "Search...",
  defaultValue = "",
  onSearch,
  debounceMs = 4000,
  className = "",
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onSearch(value)
    }, debounceMs)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value])

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
      <Input
      name="search"
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 h-8 py-1 bg-gray-800"
        autoComplete="off"
      />
    </div>
  )
}