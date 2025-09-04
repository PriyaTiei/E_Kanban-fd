"use client"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { deleteSupplyKanban, fetchSupplyKanbans, fetchSupplyKanbansCount, updateSupplyKanban } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { useSearchParams } from "next/navigation"
import KanbanTable from "../components/KanbanTable"
import Loading from "../components/loading"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getPaginationItems } from "../lib/helpers"

function SupplyListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [totalKanbans, setTotalKanbans] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [processFilters, setProcessFilters] = useState<number[] | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const limit = 20

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : undefined

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      const queryParams = selectedProcess ? { process: selectedProcess } : undefined
      const result = await fetchSupplyKanbans({...queryParams, page, limit})
      const countResult = await fetchSupplyKanbansCount(queryParams)
      const kanbans = result?.kanbans || []
      
      setData(kanbans)
      setTotalKanbans(countResult?.total || 0)
      setProcessFilters(result?.processes || null)
      setCurrentPage(page)
      console.log("totalPages:", result?.totalPages || 1);
      
      setTotalPages(result?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching supply kanbans:", error)
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
        onUpdate={updateSupplyKanban}
        onDelete={deleteSupplyKanban}
        title="Supply List"
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
                    className={`${currentPage === idx + 1 ? "bg-blue-600 text-white hover:bg-blue-600" : ""}`}
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
  )
}

export default function SupplyListPage() {
  return (
    <Suspense
      fallback={
        <Loading />
      }
    >
      <SupplyListContent />
    </Suspense>
  )
}
