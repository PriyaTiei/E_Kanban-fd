"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { deletePreparationKanban, fetchPreparationKanbans, updatePreparationKanban } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { Suspense } from "react"
import KanbanTable from "../components/KanbanTable"

function PreparationListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [processFilters, setProcessFilters] = useState<number[] | null>(null)
  const [isFrozenData, setIsFrozenData] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const queryParams = selectedProcess ? { process: selectedProcess } : undefined
      const result = await fetchPreparationKanbans(queryParams)
      setProcessFilters(result?.processes || null)
      setData(result?.kanbans || []);
      setIsFrozenData(result?.isFrozenData || false)
    } catch (error) {
      console.error("Error fetching preparation kanbans:", error)
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
        isFrozenData={isFrozenData}
        onUpdate={updatePreparationKanban}
        onDelete={deletePreparationKanban}
        title="Preparation List"
        onRefresh={fetchData}
      />
    </div>
)}

export default function PreparationListTableClient() {
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
      <PreparationListContent />
    </Suspense>
  )
}
