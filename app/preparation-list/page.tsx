"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { deletePreparationKanban, fetchPreparationKanbans, fetchPreparationKanbansCount, updatePreparationKanban } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { Suspense } from "react"
import KanbanTable from "../components/KanbanTable"
import Loading from "../components/loading"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getPaginationItems } from "../lib/helpers"
import { ChevronLeft, ChevronRight } from "lucide-react"

function PreparationListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [totalKanbans, setTotalKanbans] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [processFilters, setProcessFilters] = useState<number[] | null>(null)
  const [isFrozenData, setIsFrozenData] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const limit = 20

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : null

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const queryParams = selectedProcess ? { process: selectedProcess } : undefined
      const result = await fetchPreparationKanbans({...queryParams, page, limit})
      const countResult = await fetchPreparationKanbansCount(queryParams)
      console.log("Fetched countResult:", countResult || "No countResult");
      
      
      setData(result?.kanbans || []);
      setIsFrozenData(result?.isFrozenData || false)
      setTotalKanbans(countResult?.total || 0)
      setProcessFilters(result?.processes || null)
      console.log("Fetched result:", result || "No result");     
      setCurrentPage(page)
      setTotalPages(result?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching preparation kanbans:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [selectedProcess, currentPage])

  if (loading) {
    return (
      <Loading />
    )
  }

  const pages = getPaginationItems(currentPage, totalPages)

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
      <KanbanTable
        data={data}
        totalKanbans={totalKanbans}
        processFilters={processFilters}
        isFrozenData={isFrozenData}
        onUpdate={updatePreparationKanban}
        onDelete={deletePreparationKanban}
        title="Preparation List"
        onRefresh={fetchData}
      />
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            {pages.map((page, idx) => (
              <PaginationItem key={idx}>
                {page === '...' ? (
                  <span className="px-2">...</span>
                ) : (
                  <PaginationLink
                    href="#"
                    className={`${typeof page === 'number' && currentPage === Number(page) ? "bg-blue-600 text-white hover:bg-blue-600" : ""}`}
                    isActive={currentPage === page}
                    onClick={(e) => {
                      e.preventDefault()
                      fetchData(page as number)
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
)}

export default function PreparationListTableClient() {
  return (
    <Suspense
      fallback= {
        <Loading />
      }
    >
      <PreparationListContent />
    </Suspense>
  )
}
