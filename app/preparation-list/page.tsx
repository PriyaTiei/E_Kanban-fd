"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { deleteAllPreparationKanban, deletePreparationKanban, fetchPreparationKanbans, fetchPreparationKanbansCount, updateAllPreparationKanban, updatePreparationKanban } from "../lib/api"
import type { KanbanItem, QueryParams } from "../lib/types"
import { Suspense } from "react"
import KanbanTable from "../components/KanbanTable"
import Loading from "../components/loading"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { getPaginationItems } from "../lib/helpers"

function PreparationListContent() {
  const [data, setData] = useState<KanbanItem[]>([])
  const [totalKanbans, setTotalKanbans] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [processFilters, setProcessFilters] = useState<string[] | null>(null)
  const [isFrozenData, setIsFrozenData] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const limit = 20

  const selectedProcess = searchParams.get("process") ? searchParams.get("process") : null
  const searchedParameter = searchParams.get("search") ? String(searchParams.get("search")!) : null

  const fetchData = async (page = 1) => {
    setLoading(true)
    try {
      let queryParams: QueryParams = selectedProcess ? { process: selectedProcess, page, limit } : {page, limit}
      console.log(`querying for selected process: ${selectedProcess}`);
      
      if (searchedParameter){
        queryParams = { ...queryParams, search: searchedParameter }
        if (totalPages < page) page = 1 // Reset to first page on new search
      }
      const result = await fetchPreparationKanbans(queryParams)
      const totalCount = result?.total ?? 0 // await fetchPreparationKanbansCount(queryParams)
      
      setData(result?.kanbans || []);
      setIsFrozenData(result?.isFrozenData || false)
      setTotalKanbans(totalCount)
      setProcessFilters(result?.processes || null)
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
        totalKanbans={totalKanbans}
        processFilters={processFilters}
        isFrozenData={isFrozenData}
        onUpdate={updatePreparationKanban}
        onUpdateAll={updateAllPreparationKanban}
        onDelete={deletePreparationKanban}
        onDeleteAll={deleteAllPreparationKanban}
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
