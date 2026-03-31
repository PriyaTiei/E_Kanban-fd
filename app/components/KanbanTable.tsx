"use client"

import {  useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { KanbanItem, KanbanModifyDetails } from "../lib/types"
import { useAuth } from "../contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Loader2, History, Snowflake, Play, CircleCheck, CircleCheckBig, CircleX, KanbanSquare, Timer, Undo2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { BreadcrumbEllipsis } from "@/components/ui/breadcrumb"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import KanbanCard from "./KanbanCard"
import KanbanRequestsForm from "./KanbansRequestForm"
import SearchBar from "./SearchBar"
import { freezeProcess, unfreezeProcess } from "../lib/api"

interface KanbanTableProps {
  data: KanbanItem[]
  totalKanbans: number
  processFilters: string[] | null
  isFrozenData?: boolean
  // onSearch: (value: string) => void
  onUpdate: (updateKanban: KanbanModifyDetails) => Promise<boolean>
  onUpdateAll: (process: string | undefined | null) => Promise<boolean>
  onDelete: (deleteKanban: KanbanModifyDetails) => Promise<boolean>
  onDeleteAll: (process: string | undefined | null) => Promise<boolean>
  onReport?: (reportKanban: KanbanModifyDetails) => Promise<boolean>
  onUndoReport?: (reportKanban: KanbanModifyDetails) => Promise<boolean>
  title: string
  onRefresh?: () => void
}

export default function KanbanTable({
  data,
  totalKanbans,
  processFilters,
  isFrozenData,
  // onSearch,
  onUpdate,
  onUpdateAll,
  onDelete,
  onDeleteAll,
  onReport,
  onUndoReport,
  title,
  onRefresh,
}: KanbanTableProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<{ [key: number]: "update" | "delete" | "report" | "undo_report" | null }>({})
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [requestFormOpen, setRequestFormOpen] = useState(false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  const paramProcess = searchParams.get("process") ? searchParams.get("process") : null
  const [selectedProcess, setSelectedProcess] = useState<string | null>(paramProcess)
  const searchedParameter = searchParams.get("search") ? String(searchParams.get("search")!) : null
  const isPreparationSheet = title === "Preparation List"
  const isSupplySheet = title === "Supply List"
  const isDelaySheet = title === "Delay List"  

  const isAllowedPrepSheetUsers = user?.role === "admin" || user?.role === "supplier"
  const isAllowedSupplySheetUsers = user?.role === "admin" || user?.role === "supplier"
  const isAllowedDelaySheetUsers = user?.role === "admin" || user?.role === "logistics"

  const showActions = selectedProcess !== null && ((isPreparationSheet && isAllowedPrepSheetUsers) || (isSupplySheet && isAllowedSupplySheetUsers) || (isDelaySheet && isAllowedDelaySheetUsers))
  
  // Check if current process is frozen (from data)
  const isFrozen = selectedProcess ? isFrozenData === true : false

  const handleProcessFilter = (process: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (process) {
      console.log(`Setting process filter in params to: ${process}`)
      params.set("process", process.toString())
      setSelectedProcess(process)
    } else {
      params.delete("process")
      setSelectedProcess(null)
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleSearchFilter = (search: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (search) {
      console.log(`Searching for: ${search}`)
      params.set("search", search.toString())
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`, { scroll: true })
  }

  const handleFreezeToggle = async () => {
    console.log(`isFrozen: ${isFrozen}, isFrozenData: ${isFrozenData}`)

    if (!selectedProcess) return

    setFreezeLoading(true)
    try {
      const result = isFrozen ? await unfreezeProcess(selectedProcess) : await freezeProcess(selectedProcess)

      if (result.status === 200) {
        toast({
          title: isFrozen ? "Process Unfrozen" : "Process Frozen",
          description: `Process ${selectedProcess} has been ${isFrozen ? "unfrozen" : "frozen"} successfully.`,
        })
        onRefresh?.()
      } else {
        toast({
          title: "Action Failed",
          description: result.error || `Failed to ${isFrozen ? "unfreeze" : "freeze"} process.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while ${isFrozen ? "unfreezing" : "freezing"} the process.`,
        variant: "destructive",
      })
    } finally {
      setFreezeLoading(false)
    }
  }

  const handleAction = async (kanbanIds: number[], action: "update" | "delete" | "report" | "undo_report") => {
    console.log(`Handling action: ${action} for kanbanId: ${kanbanIds}`)

    const stateUpdate = kanbanIds.reduce((acc, id) => {
      acc[id] = action;
      return acc;
    }, {} as Record<number, "update" | "delete" | "report" | "undo_report" | null>)
    setLoading((prev) => ({ ...prev, ...stateUpdate }))

    try {
      const modifyDetails = { kanbanIds}
      console.log(`Attempting to ${action} kanban item:`, modifyDetails)

      const success = action === "update" ? 
      await onUpdate(modifyDetails) : action === "report" ? await onReport?.(modifyDetails) : action === "undo_report" ? await onUndoReport?.(modifyDetails) : await onDelete(modifyDetails)
      if (success) {
        toast({
          title: action === "update" ? "Kanban Updated" : action === "report" ? "Kanban Reported" : action === "delete" ? "Kanban Deleted" : "Report Undone",
          description: `Item has been successfully ${action === "update" ? "marked as done" : action === "report" ? "reported as delayed" : action === "delete" ? "rejected" : "removed from delay report"}.`,
        })
        onRefresh?.()
      } else {
        toast({
          title: "Action Failed",
          description: `Failed to ${action} kanban item.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing kanban:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${action}ing the kanban item.`,
        variant: "destructive",
      })
    } finally {
      const stateUpdate = kanbanIds.reduce((acc, id) => {
        acc[id] = null;
        return acc;
      }, {} as Record<number, "update" | "delete" | "report" | null>)
      setLoading((prev) => ({ ...prev, ...stateUpdate }))
    }
  }

  const handleModifyAllAction = async (action: "update" | "delete") => {
    console.log(`Handling action: ${action} for all kanbans ${selectedProcess && `in process ${selectedProcess}`}`)

    try {
      const success = action === "update" ? await onUpdateAll(selectedProcess) : await onDeleteAll(selectedProcess)
      if (success) {
        toast({
          title: action === "update" ? "Kanban Updated" : "Kanban Deleted",
          description: `Kanban item has been successfully ${action === "update" ? "marked as done" : "rejected"}.`,
        })
        onRefresh?.()
      } else {
        toast({
          title: "Action Failed",
          description: `Failed to ${action} kanban item.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing kanban:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${action}ing the kanban item.`,
        variant: "destructive",
      })
    }
  }

  const columns: Partial<keyof KanbanItem>[] = data && data.length !== 0 ? Object.keys(data[0]).filter((key) => {
    const commonFilters = [
      "id",
      "partId",
      "partName",
      "arrangedAt",
      "reportId",
    ]

    const prepSheetFilters = [
      "reportedAt",
    ]
    const filtersToApply = isPreparationSheet ? [...commonFilters, ...prepSheetFilters] : commonFilters
    return !filtersToApply.includes(key)
  }) as Partial<keyof KanbanItem>[] : [] as Partial<keyof KanbanItem>[]

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-row items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h2 className={`text-2xl md:text-3xl font-bold ${isFrozen && isPreparationSheet ? "text-blue-400" : ""}`}>
              {title} {isFrozen && isPreparationSheet && <Snowflake className="inline h-4 w-4 md:h-5 md:w-5 ml-1" />}
            </h2>
            <div className="text-xs md:text-sm text-gray-400 mt-1">
              Total <span className="text-white">{totalKanbans}</span> {totalKanbans === 1 ? "kanban" : "kanbans"} pending {selectedProcess && <>for process <span className="text-white">{selectedProcess}</span></>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <Link href="/kanban-logs">
              <Button variant="outline" size="sm" className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700">
                <History className="h-4 w-4 mr-2" />
                <span className="text-xs md:text-sm">View Logs</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Process Filter Buttons */}
        {(
          <div className="w-full">
            <div className="text-xs md:text-sm text-gray-400 mb-2">Select Process</div>
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                <button
                  onClick={() => handleProcessFilter(null)}
                  className={`px-3 py-1 text-sm font-medium transition-colors rounded ${
                    !selectedProcess ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  All
                </button>
                {processFilters && processFilters.map((process) => (
                  <button
                    key={process}
                    onClick={() => handleProcessFilter(process)}
                    className={`h-8 px-3 py-1 font-medium text-xs md:text-sm transition-colors rounded ${
                      selectedProcess === process
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {process}
                  </button>
                ))}
              </div>
              <div className="w-full md:w-fit flex items-center gap-2 flex-wrap">
                {/* <div className="flex items-center gap-2 flex-wrap"> */}
                  {isPreparationSheet && showActions && selectedProcess && selectedProcess !== 'rank parts' && (
                    <Button
                      onClick={handleFreezeToggle}
                      disabled={freezeLoading}
                      size="sm"
                      className={`w-fit h-8 ${
                        isFrozen
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                        >
                      {freezeLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : isFrozen ? (
                        <Play className="h-4 w-4 mr-1" />
                      ) : (
                        <Snowflake className="h-4 w-4 mr-1" />
                      )}
                      <span>{isFrozen ? "Unfreeze" : "Freeze"} List</span>
                    </Button>
                  )}
                  <SearchBar onSearch={handleSearchFilter} defaultValue={searchedParameter || ""} className="w-auto min-w-28 max-w-44 lg:max-w-full" />
                {/* </div> */}
                { !(isDelaySheet && user?.role === "logistics") && showActions && (
                  <div className="ml-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-50 bg-gray-900 border border-gray-700 rounded-md py-3 px-2 flex flex-col gap-2 text-xs">
                        { isPreparationSheet &&
                          <>
                            <DropdownMenuItem>
                              <button className="w-full px-2 py-1 rounded flex items-center" onClick={() => setRequestFormOpen(true)}>
                                <KanbanSquare className="h-6 w-6 p-[0.125rem] mr-2 bg-blue-600 text-black rounded" />
                                Raise a Kanban Request
                              </button>
                            </DropdownMenuItem>
                          </>
                        }
                        {isPreparationSheet && user?.role === "admin" && <DropdownMenuSeparator className="h-[1px] bg-gray-700" />}
                        {(user?.role === "admin" || isSupplySheet) && (
                          <>
                            <DropdownMenuItem>
                              <button className="w-full px-2 py-1 rounded flex items-center" onClick={() => handleAction(data.map(item => item.id), "update")}>
                                <CircleCheckBig className="h-6 w-6 p-[0.125rem] mr-2 bg-green-600 text-black rounded-full" />
                                Mark current page as done
                              </button>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="h-[1px] bg-gray-700" />
                            <DropdownMenuItem>
                              <button className="w-full px-2 py-1 rounded flex items-center" onClick={() => handleModifyAllAction( "update")}>
                                <CircleCheckBig className="h-6 w-6 p-[0.125rem] mr-2 bg-green-600 text-black rounded-full" />
                                Mark all as done
                              </button>
                            </DropdownMenuItem>
                            {user?.role === "admin" && 
                              <>
                                <DropdownMenuSeparator className="h-[1px] bg-gray-700" />
                                <DropdownMenuItem>
                                  <button className="w-full px-2 py-1 rounded flex items-center" onClick={() => handleAction(data.map(item => item.id), "delete")}>
                                    <CircleX className="h-6 w-6 p-[0.125rem] mr-2 bg-red-600/90 text-black rounded-full" />
                                    Reject all
                                  </button>
                                </DropdownMenuItem>
                              </>
                            }
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <KanbanRequestsForm requestFormOpen={requestFormOpen} setRequestFormOpen={setRequestFormOpen} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {!data || data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No data available</div>
        )
        : (
        <> 
          {/* Kanban Cards for Mobile View */}
          <div className="block md:hidden">
            <div className="grid gap-4">
              {data.map((item, index) => (
                <KanbanCard
                  key={`${item.id || index}-card`}
                  item={item}
                  index={index}
                  handleAction={handleAction}
                  loading={loading[item.id] || null}
                  isPreparationSheet={isPreparationSheet}
                  isSupplySheet={isSupplySheet}
                  // isDelaySheet={isDelaySheet}
                  showActions={showActions}
                  isFrozen={isFrozen}
                />
              ))}
            </div>
          </div>

          {/* Kanban Table for Desktop View */}
          <div className="hidden md:block table-container">
            <div className="overflow-x-auto">
              <div className="flex items-center gap-4">
                { isPreparationSheet &&
                  <table className="absolute -translate-x-1/2 z-10">
                    <thead>
                      <tr >
                        <th className="px-6 py-5"/>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent">
                      {data.map((item, index) => (
                        <tr key={`${item.id || index}-delay`}>
                          <td className={`px-6 ${!selectedProcess ?"py-[0.625rem]": "py-4"}`}>
                            <div className="w-8 h-8 p-1">
                              {item.arrangedAt ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-6 h-6 z-10 flex items-center justify-center border rounded-full border-green-700 bg-green-900/60">
                                      <Timer className="h-4 w-4 text-green-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 border border-gray-700 text-gray-300">
                                    {`Arranged at ${new Date(item.arrangedAt).toLocaleString()}`}
                                  </TooltipContent>
                                </Tooltip>
                              ) :
                              item.reportedAt && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-6 h-6 z-10 flex items-center justify-center border rounded-full border-yellow-700 bg-yellow-900/60">
                                      <Timer className="h-4 w-4 text-yellow-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 border border-gray-700 text-gray-300">
                                    {`Reported at ${new Date(item.reportedAt).toLocaleString()}`}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                        </tr>

                      ))}
                    </tbody>
                  </table>
                }
                <table className={`w-full ${isFrozen && isPreparationSheet ? "border-2 border-blue-400" : ""}`}>
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        SL. No.
                      </th>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          {column.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </th>
                      ))}
                      {showActions && (
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider flex items-center justify-center">
                          <span>Actions</span>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="relative divide-y divide-gray-700">
                    {data.map((item, index) => (
                      <tr key={item.id || index} className="hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {index + 1}
                          </td>
                        {columns.map((column) => (
                          <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {typeof item[column] === "string" &&
                            /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(item[column] as string)
                              ? new Date(item[column] as string).toLocaleString()
                              : String(item[column] ?? "-")}
                          </td>
                        ))}
                        {showActions && (
                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-row items-center justify-center space-x-2 flex-wrap">
                              <button
                                onClick={() => handleAction([item.id], "update")}
                                disabled={loading[item.id] != null || (item.reportId && item.arrangedAt === null) ? true : false}
                                className="p-0 flex items-center justify-center w-8 h-8 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Mark as Done"
                              >
                                {loading[item.id] === "update" ? (
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                  <CircleCheck className="h-6 w-6 p-[0.125rem] btn-success text-black rounded-full" />
                                )}
                              </button>
                              {(user?.role === "admin" || (user?.role === "supplier" && !isSupplySheet && (isPreparationSheet && !item.arrangedAt))) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                      <BreadcrumbEllipsis className="h-5 w-5 text-gray-400" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="center" className="z-50 w-fit rounded-md bg-gray-800 border border-gray-700 px-2 py-3 flex flex-col gap-2 text-xs">
                                    {user?.role === "admin" && (
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <button
                                            disabled={loading[item.id] != null}
                                            className="p-2 flex items-center justify-start gap-1"
                                            title="Reject"
                                          >
                                            {loading[item.id] === "delete" ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <>
                                              <CircleX className="h-6 w-6 p-[0.125rem] mr-2 bg-red-600/90 text-black rounded-full" />
                                              Reject
                                              </>
                                            )}
                                          </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                                          <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">Confirm Rejection</AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-300">
                                              Are you sure you want to reject this kanban request for{" "}
                                              <strong>{item.partIdNo}</strong>? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleAction([item.id], "delete")}
                                              className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                              Reject
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    )}
                                    {!item.arrangedAt && isPreparationSheet && (user?.role === "supplier" || user?.role === "admin") && (
                                      <>
                                        {user?.role === "admin" && <DropdownMenuSeparator className="h-[1px] bg-gray-700" />}
                                        <DropdownMenuItem>
                                          { item.reportedAt ? (
                                            <button
                                              disabled={loading[item.id] != null}
                                              className="p-2 flex items-center justify-start gap-1"
                                              title="Undo delay report"
                                              onClick={() => handleAction([item.reportId!], "undo_report")}
                                            >
                                              {loading[item.id] === "undo_report" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <>
                                                <Undo2 className="h-6 w-6 p-[0.125rem] mr-2 bg-gray-400/90 text-black rounded-full" />
                                                Undo delay report
                                                </>
                                              )}
                                            </button>
                                            ) : (
                                            <button
                                              disabled={loading[item.id] != null}
                                              className="p-2 flex items-center justify-start gap-1"
                                              title="Report as delayed"
                                              onClick={() => handleAction([item.id], "report")}
                                            >
                                              {loading[item.id] === "report" ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <>
                                                <Timer className="h-6 w-6 p-[0.125rem] mr-2 bg-yellow-600/90 text-black rounded-full" />
                                                Report as delayed
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
