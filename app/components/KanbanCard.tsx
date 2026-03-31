"use client"

import { Check, Loader2, MapPin, Package, Timer, Undo2, XCircle } from "lucide-react"
import type { KanbanItem } from "../lib/types"
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
import { BreadcrumbEllipsis } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "../contexts/AuthContext"
import { formatDate } from "../lib/helpers"

interface KanbanCardProps {
  item: KanbanItem
  index: number
  handleAction: (kanbanIds: number[], action: "update" | "delete" | "report" | "undo_report") => Promise<void>,
  showActions: boolean
  isFrozen: boolean
  loading: "update" | "delete" | "report" | "undo_report" | null
  isPreparationSheet: boolean
  isDelaySheet?: boolean
  isSupplySheet?: boolean
}

export default function KanbanCard({ item, index, handleAction, showActions, isFrozen, loading, isPreparationSheet, isSupplySheet }: KanbanCardProps) {
  const { user } = useAuth()
  // const isAllowedPrepSheetUsers = user?.role === "admin" || user?.role === "supplier"
  // const isAllowedSupplySheetUsers = user?.role === "admin" || user?.role === "supplier"
  // const isAllowedDelaySheetUsers = user?.role === "admin" || user?.role === "logistics"

  return (
    <Card key={index} className={`bg-gray-800 ${isFrozen && isPreparationSheet ? 'border-blue-400/70' : 'border-gray-700'} transition-colors`}>
      <CardContent className="p-0">
        <div className="flex justify-between gap-2">
          {/* Header with index and key info */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2 p-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="h-6 text-xs bg-gray-700 border-gray-600 text-gray-300">
                  #{index + 1}
                </Badge>
                <Badge variant="outline" className="h-6 text-xs bg-blue-900/20 border-blue-700 text-blue-400">
                  Process {item.process}
                </Badge>
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
                {showActions && (user?.role === "admin" || (user?.role === "supplier" && !isSupplySheet && (isPreparationSheet && !item.arrangedAt))) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {/* <div className="flex items-center cursor-pointer px-2 py-2 border border-gray-700 rounded-full hover:bg-gray-700 transition-colors"> */}
                      <BreadcrumbEllipsis className="h-5 w-5 text-gray-400" />
                    {/* </div> */}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" alignOffset={-20} className="w-fit z-50 rounded-md bg-gray-900 border border-gray-700 px-2 py-3 flex flex-col gap-2 text-xs">
                    {user?.role === "admin" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={loading && loading[item.id] != null ? true : false}
                            className="p-2 flex items-center justify-start gap-1"
                            title="Reject"
                          >
                            {loading && loading[item.id] === "delete" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                              <XCircle className="h-6 w-6 p-[0.125rem] mr-2 bg-red-600/90 text-black rounded-full" />
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
                              <strong>{item.partName}</strong>? This action cannot be undone.
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
                              disabled={loading && loading[item.id] != null ? true : false}
                              className="p-2 flex items-center justify-start gap-1"
                              title="Undo delay report"
                              onClick={() => handleAction([item.reportId!], "undo_report")}
                            >
                              {loading && loading[item.id] === "undo_report" ? (
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
                              disabled={loading && loading[item.id] != null ? true : false}
                              className="p-2 flex items-center justify-start gap-1"
                              title="Report as delayed"
                              onClick={() => handleAction([item.id], "report")}
                            >
                              {loading && loading[item.id] === "report" ? (
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
                <div className="flex items-center space-x-2">
                  { item?.acknowledgedAt ?
                    <span className="font-medium text-white/70 text-xs">Prepared: {formatDate(String(item?.acknowledgedAt))}</span>
                    : item?.requestedAt &&
                    <span className="font-medium text-white/70 text-xs">Requested: {formatDate(String(item?.requestedAt))}</span>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="p-2 max-w-16 w-full flex flex-col items-center gap-2 flex-wrap">
              
              <Button
                onClick={() => handleAction([item.id],"update")}
                disabled={loading && loading[item.id] !== null || (item.reportId && item.arrangedAt === null) ? true : false}
                className="self-end w-full flex-1 bg-green-600 hover:bg-green-700 text-white disabled:cursor-not-allowed disabled:opacity-50"
                size="sm"
              >
                {loading && loading[item.id] === "update" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
