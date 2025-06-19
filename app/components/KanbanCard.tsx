"use client"

import { useState } from "react"
import { Check, X, Loader2, MapPin, Package } from "lucide-react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/AuthContext"

interface KanbanCardProps {
  item: KanbanItem
  index: number
  onUpdate: (updateKanban: KanbanModifyDetails) => Promise<boolean>
  onDelete: (deleteKanban: KanbanModifyDetails) => Promise<boolean>
  showActions: boolean
  onRefresh?: () => void
}

export default function KanbanCard({ item, index, onUpdate, onDelete, showActions, onRefresh }: KanbanCardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<"update" | "delete" | null>(null)
  const { toast } = useToast()

  const handleAction = async (action: "update" | "delete") => {
    setLoading(action)

    try {
      const modifyDetails = { kanbanId: item.id }
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
      setLoading(null)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with index and key info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-gray-700 border-gray-600 text-gray-300">
                  #{index + 1}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-700 text-blue-400">
                  Process {item.process}
                </Badge>
              </div>

              {/* Part Name - Highlighted */}
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white text-lg">{item.partName}</span>
              </div>

              {/* Station Name - Highlighted */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-400" />
                <span className="font-medium text-green-400">{item.stationName}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.plantName && (
              <div>
                <span className="text-gray-400">Plant:</span>
                <span className="ml-2 text-white">{item.plantName}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400">Requested:</span>
              <span className="ml-2 text-white">{new Date(item.requestedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex space-x-2 pt-2 border-t border-gray-700">
              <Button
                onClick={() => handleAction("update")}
                disabled={loading !== null}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                {loading === "update" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Mark Done
              </Button>

              {user?.role === "admin" ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={loading !== null} variant="destructive" size="sm" className="flex-1">
                      {loading === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-gray-800 border-gray-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Confirm Rejection</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        Are you sure you want to reject this kanban request for <strong>{item.partName}</strong>? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleAction("delete")}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  disabled={loading !== null}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    toast({
                      title: "Not allowed",
                      description: "You are not allowed to reject kanban requests.",
                      variant: "destructive",
                    })
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
