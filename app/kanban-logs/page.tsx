"use client"

import { useEffect, useState } from "react"
import { fetchKanbanLogs } from "../lib/api"
import type { KanbanItem } from "../lib/types"
import { History, RefreshCw, Filter, Package, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function KanbanLogsPage() {
  const [logs, setLogs] = useState<KanbanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "preparation" | "supply">("all")

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await fetchKanbanLogs()
      setLogs(data)
    } catch (error) {
      console.error("Error loading kanban logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true
    // You can add logic here to differentiate between preparation and supply logs
    // For now, we'll show all logs
    return true
  })

  const getStatusBadge = (log: KanbanItem) => {
    if (log.fulfilled) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-900/20 text-green-400 border border-green-700">
          Fulfilled
        </span>
      )
    } else if (log.acknowledgedByLogistics) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-900/20 text-blue-400 border border-blue-700">
          Acknowledged
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-900/20 text-yellow-400 border border-yellow-700">
          Pending
        </span>
      )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <History className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Kanban Logs</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as "all" | "preparation" | "supply")}
              className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Logs</option>
              <option value="preparation">Preparation</option>
              <option value="supply">Supply</option>
            </select>
          </div>
          <Button onClick={loadLogs} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
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
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <History className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Logs Found</h3>
          <p className="text-gray-500">No kanban logs are available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-blue-400" />
                          <span className="font-medium text-white">Product: {log.productName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300">{log.stationName}</span>
                        </div>
                      </div>
                      {getStatusBadge(log)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Part:</span>
                        <span className="ml-2 text-white">{log.partName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Plant:</span>
                        <span className="ml-2 text-white">{log.plantName || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Requested:</span>
                        <span className="ml-2 text-white">{new Date(log.requestedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {log.acknowledgedByLogistics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Acknowledged:</span>
                          <span className="ml-2 text-blue-400">
                            {log.acknowledgedAt ? new Date(log.acknowledgedAt).toLocaleString() : "Yes"}
                          </span>
                        </div>
                        {log.fulfilled && log.fulfilledAt && (
                          <div>
                            <span className="text-gray-400">Fulfilled:</span>
                            <span className="ml-2 text-green-400">{new Date(log.fulfilledAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
