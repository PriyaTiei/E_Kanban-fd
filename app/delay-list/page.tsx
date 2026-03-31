"use client"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { deleteAllDelayKanban, deleteAllSupplyKanban, deleteDelayKanban, deleteSupplyKanban, fetchDelayKanbans, fetchSupplyKanbans, fetchSupplyKanbansCount, updateAllDelayKanban, updateAllSupplyKanban, updateDelayKanban, updateSupplyKanban } from "../lib/api"
import type { KanbanItem, QueryParams } from "../lib/types"
import { useSearchParams } from "next/navigation"
import KanbanTable from "../components/KanbanTable"
import Loading from "../components/loading"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getPaginationItems } from "../lib/helpers"

function DelayListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [totalReports, setTotalReports] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [processFilters, setProcessFilters] = useState<string[] | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const limit = 20

  const selectedProcess = searchParams.get("process") ? searchParams.get("process") : undefined
  const searchedParameter = searchParams.get("search") ? String(searchParams.get("search")!) : null

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      let queryParams: QueryParams = selectedProcess ? { process: selectedProcess, page, limit } : {page, limit}
      if (searchedParameter){
        queryParams = { ...queryParams, search: searchedParameter }
        if (totalPages < page) page = 1 // Reset to first page on new search
      }
      console.log("Fetching with queryParams:", queryParams);
      const result = await fetchDelayKanbans(queryParams)
      const totalCount = result?.total ?? 0 // await fetchDelayKanbansCount(queryParams)
      const kanbans = result?.kanbans || []
      
      setData(kanbans)
      setTotalReports(totalCount)
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
  }, [selectedProcess, searchedParameter, currentPage])

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
        totalKanbans={totalReports}
        processFilters={processFilters}
        onUpdate={updateDelayKanban}
        onUpdateAll={updateAllDelayKanban}
        onDelete={deleteDelayKanban}
        onDeleteAll={deleteAllDelayKanban}
        title="Delay List"
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

export default function DelayListPage() {
  return (
    <Suspense
      fallback={
        <Loading />
      }
    >
      <DelayListContent />
    </Suspense>
  )
}
