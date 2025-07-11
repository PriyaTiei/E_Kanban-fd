"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { deletePreparationKanban, fetchPreparationKanbans, updatePreparationKanban } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { Suspense } from "react"
import KanbanTable from "../components/KanbanTable"
import Loading from "../components/loading"

function PreparationListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [processFilters, setProcessFilters] = useState<number[] | null>(null)
  const [isFrozenData, setIsFrozenData] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : null

  const fetchData = async () => {
    setLoading(true)
    try {
      const queryParams = selectedProcess ? { process: selectedProcess } : undefined
      const result = await fetchPreparationKanbans(queryParams)
      setProcessFilters(result?.processes || null)
      console.log("Fetched result:", result || "No result");
      
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
      <Loading />
    )
  }

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
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
        <Loading />
      }
    >
      <PreparationListContent />
    </Suspense>
  )
}
