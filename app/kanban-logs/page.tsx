"use client"

import { useEffect, useRef, useState } from "react"
import { fetchKanbanLogs } from "../lib/api"
import type { KanbanLogItem, KanbanLogQueryParams } from "../lib/types"
import { History, RefreshCw, Filter, MapPin, Clock, CheckCircle, AlertCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, getPaginationItems } from "../lib/helpers"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import SearchBar from "../components/SearchBar"

export default function KanbanLogsPage() {
  const [logs, setLogs] = useState<KanbanLogItem[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [scrollUp, setScrollUp] = useState(true)
  const ticking = useRef(false)
  const lastScrollY = useRef(0)
  const [statusFilter, setStatusFilter] = useState<"all" | "requested" | "acknowledged" | "fulfilled">("all")
  const [dateTimeFilter, setDateTimeFilter] = useState<string>("")
  const [partIdNoFilter, setPartIdNoFilter] = useState<string>("")
  const limit = 20

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
            // Scrolling down
            setScrollUp(false)
          } else {
            // Scrolling up
            setScrollUp(true)
          }
          lastScrollY.current = currentScrollY
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const loadLogs = async (page = 1) => {
    setLoading(true)
    try {
      const filterParam = statusFilter === "all" ? undefined : statusFilter
      const queryParams: KanbanLogQueryParams = {
        status: filterParam,
        dateTime: dateTimeFilter || undefined,
        search: partIdNoFilter || undefined,
        page,
        limit,
      }
      const result = await fetchKanbanLogs(queryParams)
      const data = result?.logs || []
      setTotalPages(result?.totalPages || 1)
      setLogs(data)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading kanban logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setDateTimeFilter(value)
    } else {
      setDateTimeFilter("")
    }
  }

  useEffect(() => {
    loadLogs(currentPage);
  }, [currentPage, statusFilter, dateTimeFilter, partIdNoFilter]);


  const getStatusInfo = (log: KanbanLogItem) => {
    if (log.fulfilled) {
      return {
        status: "Supplied",
        color: "text-green-400",
        bgColor: "bg-green-900/20",
        borderColor: "border-green-700",
        icon: CheckCircle,
      }
    } else if (log.acknowledgedByLogistics) {
      return {
        status: "Prepared",
        color: "text-blue-400",
        bgColor: "bg-blue-900/20",
        borderColor: "border-blue-700",
        icon: Clock,
      }
    } else {
      return {
        status: "Pending",
        color: "text-yellow-400",
        bgColor: "bg-yellow-900/20",
        borderColor: "border-yellow-700",
        icon: AlertCircle,
      }
    }
  }

  // Group logs by date
  const groupedLogs = logs.reduce(
    (groups, log) => {
      const date = new Date(log.requestedAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(log)
      return groups
    },
    {} as Record<string, KanbanLogItem[]>,
  )

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const pages = getPaginationItems(currentPage, totalPages)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 md:mb-8 gap-4 flex-wrap">
        <div className="flex items-center space-x-3">
          <History className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">Kanban Logs</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer px-2 py-2 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 md:w-64 bg-gray-800 border-gray-700">
              <div className="w-full flex items-center flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "requested" | "acknowledged" | "fulfilled")}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 leading-6 text-xs md:text-sm"
                >
                  <option value="all">Select Status</option>
                  <option value="requested">Pending</option>
                  <option value="acknowledged">Prepared</option>
                  <option value="fulfilled">Supplied</option>
                </select>
                {/* Date and time filter */}
                <input
                  type="datetime-local"
                  placeholder="select date and time"
                  value={dateTimeFilter}
                  onChange={handleDateTimeChange}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs md:text-sm"
                />
                {/* <input
                  type="time"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-xs md:text-sm"
                /> */}
                <SearchBar
                  placeholder="Search by Part or Station"
                  defaultValue={partIdNoFilter}
                  debounceMs={2000}
                  onSearch={setPartIdNoFilter}
                  className="w-full border border-gray-600 text-white rounded-lg px-3 py-2 text-xs md:text-sm"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => loadLogs()} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading kanban logs...</p>
          </div>
        </div>
      ) : Object.keys(groupedLogs).length === 0 ? (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Logs Found</h3>
          <p className="text-gray-500">No kanban logs are available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLogs)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dayLogs]) => (
              <div key={date} className="space-y-4">
                <div className={`sticky top-0 bg-gray-900 py-2 z-20
                  ${scrollUp ? "top-14 sm:top-0 md:top-16" : "top-0"}`}>
                  <h2 className="md:text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    {formatDateHeader(date)}
                  </h2>
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>

                  <div className="space-y-4">
                    {dayLogs
                      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
                      .map((log) => {
                        const statusInfo = getStatusInfo(log)
                        const StatusIcon = statusInfo.icon

                        return (
                          <div key={log.id} className="relative flex items-start space-x-4 md:space-x-6">
                            {/* Timeline dot */}
                            <div
                              className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2`}
                            >
                              <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pb-4 text-sm md:text-base">
                              <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                                <CardContent className="p-4 md:p-6">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                          <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-blue-400" />
                                            <span className="text-gray-300">{log.partIdNo}</span>
                                          </div>
                                        </div>
                                        <span
                                          className={`px-2 py-1 text-xs rounded-full ${statusInfo.bgColor} ${statusInfo.color} border ${statusInfo.borderColor}`}
                                        >
                                          {statusInfo.status}
                                        </span>
                                      </div>
                                      <div className="flex gap-2 justify-between flex-wrap">
                                        <div className="flex flex-col gap-2 text-xs md:text-sm">
                                          <div className="flex items-center gap-y-2 gap-x-4 flex-wrap">
                                            <div>
                                              <span className="text-gray-400">Station:</span>
                                              <span className="ml-2 text-white">{log.stationName}</span>
                                            </div>
                                            <div>
                                              <span className="text-gray-400">Plant:</span>
                                              <span className="ml-2 text-white">{log.plantName || "N/A"}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-gray-400">Requested:</span>
                                            <span className="ml-2 text-white">{formatDate(String(log.requestedAt))}</span>
                                          </div>
                                        </div>

                                        {log.acknowledgedByLogistics && (
                                          <div className="flex flex-col justify-end items-end gap-2 text-xs md:text-sm">
                                            <div>
                                              <span className="text-gray-400">Prepared:</span>
                                              <span className="ml-2 text-blue-400">
                                                {log.acknowledgedAt ? formatDate(String(log.acknowledgedAt)) : "Yes"}
                                              </span>
                                            </div>
                                            {log.fulfilled && log.fulfilledAt && (
                                              <div>
                                                <span className="text-gray-400">Supplied:</span>
                                                <span className="ml-2 text-green-400">
                                                  {formatDate(String(log.fulfilledAt))}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center mt-8">
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
                      loadLogs(page as number)
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
