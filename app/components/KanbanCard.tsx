"use client"

import { useState } from "react"
import { Check, X, Loader2, MapPin, Package, Clock } from "lucide-react"
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
import { formatDate } from "../lib/helpers"

interface KanbanCardProps {
  item: KanbanItem
  index: number
  handleAction: (kanbanIds: number[], action: "update" | "delete") => Promise<void>,
  showActions: boolean
  isFrozen: boolean
  loading: "update" | "delete" | null
  isPreparationSheet: boolean
}

export default function KanbanCard({ item, index, handleAction, showActions, isFrozen, loading, isPreparationSheet }: KanbanCardProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  return (
    <Card key={index} className={`bg-gray-800 ${isFrozen && isPreparationSheet ? 'border-blue-400/70' : 'border-gray-700'} transition-colors`}>
      <CardContent className="p-0">
        <div className="flex justify-between gap-2">
          {/* Header with index and key info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2 p-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-gray-700 border-gray-600 text-gray-300">
                  #{index + 1}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-900/20 border-blue-700 text-blue-400">
                  Process {item.process}
                </Badge>
              </div>
              <div className="flex flex-col justify-between flex-wrap gap-1">
                <div className="flex items-baseline gap-4">
                  {/* Part Name - Highlighted */}
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-400" />
                    <span className="font-semibold text-white text-sm">{item.partIdNo}</span>
                  </div>

                  {/* Station Name - Highlighted */}
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-green-400 text-sm">{item.prepLocation || item.supplyLocation}</span>
                  </div>
                </div>
                { item?.acknowledgedAt &&
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white/70 text-xs">Prepared: {formatDate(String(item?.acknowledgedAt))}</span>
                </div>
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="p-2 flex flex-col gap-2 flex-wrap">
              <Button
                onClick={() => handleAction([item.id],"update")}
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
                    <Button disabled={loading !== null} size="sm" className="flex-1 bg-red-600/90 hover:bg-red-700/90 text-white">
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
                        onClick={() => handleAction([item.id], "delete")}
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
