"use client"

import { useState } from "react"
import { Check, X, Loader2, History } from "lucide-react"
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

interface KanbanTableProps {
  data: KanbanItem[]
  onUpdate: (updateKanban: KanbanModifyDetails) => Promise<boolean>
  onDelete: (deleteKanban: KanbanModifyDetails) => Promise<boolean>
  title: string
}

export default function KanbanTable({ data, onUpdate, onDelete, title }: KanbanTableProps) {
  const [loading, setLoading] = useState<{ [key: string]: "update" | "delete" | null }>({})
  const { toast } = useToast()

  const handleAction = async (
    plantId: number,
    stationId: number,
    productId: number,
    partId: number,
    action: "update" | "delete",
  ) => {
    console.log(`Handling action: ${action} for stationId: ${stationId}, partId: ${partId}, productId: ${productId}`)

    setLoading((prev) => ({ ...prev, [`${stationId}-${partId}-${productId}`]: action }))

    try {
      const modifyDetails = { plantId: plantId, stationId: stationId, partId: partId, productId: productId }
      console.log(`Attempting to ${action} kanban item:`, modifyDetails)

      const success = action === "update" ? await onUpdate(modifyDetails) : await onDelete(modifyDetails)
      if (success) {
        toast({
          title: action === "update" ? "Kanban Updated" : "Kanban Deleted",
          description: `Kanban item has been successfully ${action === "update" ? "marked as done" : "rejected"}.`,
        })
        // Refresh the page or update the data
        window.location.reload()
      } else {
        toast({
          title: "Action Failed",
          description: `Failed to ${action} kanban item. Please try again.`,
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
      setLoading((prev) => ({ ...prev, [`${stationId}-${partId}-${productId}`]: null }))
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
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
      "productId",
    ]
    if (title === "Preparation List") {
      return ![...commonFilters, "acknowledgedAt"].includes(key)
    }
    return !commonFilters.includes(key)
  }) as Partial<keyof KanbanItem>[]

  return (
    <div className="card">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="text-sm text-gray-400 mt-1">
            Total <span className="text-white">{data.length}</span> {data.length === 1 ? "kanban" : "kanbans"} pending
          </div>
        </div>
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
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
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
                          handleAction(item.plantId, item.stationId, item.productId, item.partId, "update")
                        }
                        disabled={loading[`${item.stationId}-${item.partId}-${item.productId}`] != null}
                        className="btn-success p-0 flex items-center justify-center w-8 h-8"
                        title="Mark as Done"
                      >
                        {loading[`${item.stationId}-${item.partId}-${item.productId}`] === "update" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={loading[`${item.stationId}-${item.partId}-${item.productId}`] != null}
                            className="btn-danger p-0 flex items-center justify-center w-8 h-8"
                            title="Reject"
                          >
                            {loading[`${item.stationId}-${item.partId}-${item.productId}`] === "delete" ? (
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
                                handleAction(item.plantId, item.stationId, item.productId, item.partId, "delete")
                              }
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
