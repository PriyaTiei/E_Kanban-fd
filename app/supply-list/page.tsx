"use client"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { deleteSupplyKanban, fetchSupplyKanbans, updateSupplyKanban } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { useSearchParams } from "next/navigation"
import KanbanTable from "../components/KanbanTable"

function SupplyListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [processFilters, setProcessFilters] = useState<number[] | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      // Note: Supply kanbans don't have process filtering in the API
      // So, we are filtering client-side
      const result = await fetchSupplyKanbans()
      const processes = [...new Set(result?.map((item) => item.process))].sort((a, b) => a - b)
      setProcessFilters(processes)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <KanbanTable
        data={data}
        processFilters={processFilters}
        onUpdate={updateSupplyKanban}
        onDelete={deleteSupplyKanban}
        title="Supply List"
        onRefresh={fetchData}
      />
    </div>
  )
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
