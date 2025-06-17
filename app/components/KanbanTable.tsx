"use client"

import { useState } from "react"
import { Check, X, Loader2, History, Snowflake, Play } from "lucide-react"
import Link from "next/link"
import type { KanbanItem, KanbanModifyDetails } from "../lib/types"
import { useToast } from "@/hooks/use-toast"
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
import { useAuth } from "../contexts/AuthContext"
import { useSearchParams, useRouter } from "next/navigation"
import { freezeProcess, unfreezeProcess } from "../lib/api"

interface KanbanTableProps {
  data: KanbanItem[]
  processFilters: number[] | null
  isFrozenData?: boolean
  onUpdate: (updateKanban: KanbanModifyDetails) => Promise<boolean>
  onDelete: (deleteKanban: KanbanModifyDetails) => Promise<boolean>
  title: string
  onRefresh?: () => void
}

export default function KanbanTable({ data, processFilters, isFrozenData, onUpdate, onDelete, title, onRefresh }: KanbanTableProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<{ [key: number]: "update" | "delete" | null }>({})
  const [freezeLoading, setFreezeLoading] = useState(false)
  // const [isFrozen, setIsFrozen] = useState(isFrozenData === true || false)
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedProcess = searchParams.get("process") ? Number.parseInt(searchParams.get("process")!) : null
  const isPreparationSheet = title === "Preparation List"

  // Check if current process is frozen (from data)
  const isFrozen = selectedProcess && data.length > 0 ? isFrozenData === true : false

  const handleProcessFilter = (process: number | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (process) {
      params.set("process", process.toString())
    } else {
      params.delete("process")
    }
    router.push(`?${params.toString()}`)
  }

  const handleFreezeToggle = async () => {
    console.log(`isFrozen: ${isFrozen}, isFrozenData: ${isFrozenData}`);
    
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

  const handleAction = async (
    kanbanId: number,
    action: "update" | "delete",
  ) => {
    console.log(`Handling action: ${action} for kanbanId: ${kanbanId}`)

    setLoading((prev) => ({ ...prev, [kanbanId]: action }))

    try {
      const modifyDetails = { kanbanId: kanbanId }
      console.log(`Attempting to ${action} kanban item:`, modifyDetails)

      const success = action === "update" ? await onUpdate(modifyDetails) : await onDelete(modifyDetails)
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
    } finally {
      setLoading((prev) => ({ ...prev, [kanbanId]: null }))
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className={`card ${isFrozen && isPreparationSheet ? "border-blue-500" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${isFrozen && isPreparationSheet ? "text-blue-400" : ""}`}>
            {title} {isFrozen && isPreparationSheet && <Snowflake className="inline h-5 w-5 ml-2" />}
          </h2>
          <div className="flex items-center space-x-2">
            {isPreparationSheet && selectedProcess && (
              <Button
                onClick={handleFreezeToggle}
                disabled={freezeLoading}
                className={`flex items-center space-x-2 ${
                  isFrozen ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {freezeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFrozen ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Snowflake className="h-4 w-4" />
                )}
                <span>{isFrozen ? "Unfreeze" : "Freeze"} List</span>
              </Button>
            )}
            <Link href="/kanban-logs">
              <Button
                variant="outline"
                className="flex items-center space-x-2 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <History className="h-4 w-4" />
                <span>View Logs</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Process Filter Buttons */}
        {processFilters && processFilters.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Process:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleProcessFilter(null)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  !selectedProcess ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {processFilters.map((process) => (
                <button
                  key={process}
                  onClick={() => handleProcessFilter(process)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedProcess === process
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {process}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center py-8 text-gray-400">No data available</div>
      </div>
    )
  }

  const columns: Partial<keyof KanbanItem>[] = Object.keys(data[0]).filter((key) => {
    const commonFilters = [
      "acknowledgedByLogistics",
      "fulfilled",
      "fulfilledAt",
      "id",
      "stationId",
      "partId",
      "plantId",
      "productId",
      "productName",
      "frozenData",
    ]
    if (title === "Preparation List") {
      return ![...commonFilters, "acknowledgedAt"].includes(key)
    }
    return !commonFilters.includes(key)
  }) as Partial<keyof KanbanItem>[]

  return (
    <div className={`card`}>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${isFrozen && isPreparationSheet ? "text-blue-400" : ""}`}>
            {title} {isFrozen && isPreparationSheet && <Snowflake className="inline h-5 w-5 ml-1" />}
          </h2>
          <div className="text-sm text-gray-400 mt-1">
            Total <span className="text-white">{data.length}</span> {data.length === 1 ? "kanban" : "kanbans"} pending
          </div>
        </div>
        <div className="flex flex-col items-center space-x-2">
          <Link href="/kanban-logs">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
              <History className="h-4 w-4" />
              <span>View Logs</span>
            </Button>
          </Link>
          
        </div>
      </div>

      {/* Process Filter Buttons */}
      {processFilters && processFilters.length > 0 && (
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-2">Process</div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleProcessFilter(null)}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  !selectedProcess ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {processFilters.map((process) => (
                <button
                  key={process}
                  onClick={() => handleProcessFilter(process)}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedProcess === process ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {process}
                </button>
              ))}
            </div>
            {isPreparationSheet && selectedProcess && (
              <Button
                onClick={handleFreezeToggle}
                disabled={freezeLoading}
                className={`flex items-center gap-2 ${
                  isFrozen ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {freezeLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFrozen ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Snowflake className="h-4 w-4" />
                )}
                <span>{isFrozen ? "Unfreeze" : "Freeze"} List</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="overflow-x-auto">
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {data.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-750">
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
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() =>
                          handleAction(item.id, "update")
                        }
                        disabled={loading[item.id] != null}
                        className="btn-success p-0 flex items-center justify-center w-8 h-8"
                        title="Mark as Done"
                      >
                        {loading[item.id] === "update" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>

                      {user?.role === "admin" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              disabled={loading[item.id] != null}
                              className="btn-danger p-0 flex items-center justify-center w-8 h-8"
                              title="Reject"
                            >
                              {loading[item.id] === "delete" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Confirm Rejection</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to reject this kanban request for <strong>{item.partName}</strong>{" "}
                                at <strong>{item.stationName}</strong>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleAction(item.id, "delete")
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <button
                          disabled={loading[item.id] != null}
                          className="btn-danger p-0 flex items-center justify-center w-8 h-8"
                          title="Reject"
                          onClick={() =>
                            toast({
                              title: "Not allowed",
                              description: "You are not allowed to reject kanban requests.",
                              variant: "destructive",
                            })
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
