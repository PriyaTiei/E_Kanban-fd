"use client"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { fetchSupplyKanbans } from "../lib/api"
import SupplyListTable from "./SupplyListTable"
import type { KanbanItem } from "../lib/types"
import { useSearchParams } from "next/navigation"

function SupplyListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      // Note: Supply kanbans don't have process filtering in the API yet
      // but we can filter client-side for now
      const result = await fetchSupplyKanbans()
      const filteredData = selectedProcess ? result.filter((item) => item.process === selectedProcess) : result
      setData(filteredData)
    } catch (error) {
      console.error("Error fetching supply kanbans:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedProcess])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card">
          <div className="text-center py-8 text-gray-400">Loading...</div>
        </div>
      </div>
    )
  }

  return <SupplyListTable data={data} onRefresh={fetchData} />
}

export default function SupplyListPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="card">
            <div className="text-center py-8 text-gray-400">Loading...</div>
          </div>
        </div>
      }
    >
      <SupplyListContent />
    </Suspense>
  )
}
