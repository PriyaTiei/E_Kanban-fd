"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchPreparationKanbans } from "../lib/api"
import PreparationListTable from "./PreparationListTable"
import type { KanbanItem } from "../lib/types"
import { Suspense } from "react"

function PreparationListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : undefined

  const fetchData = async () => {
    setLoading(true)
    try {
      const queryParams = selectedProcess ? { process: selectedProcess } : undefined
      const result = await fetchPreparationKanbans(queryParams)
      setData(result)
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

  return <PreparationListTable data={data} onRefresh={fetchData} />
}

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
