"use client"

import { useEffect, useState } from "react"
import { fetchStationParts, fetchProductEntryLogs } from "../lib/api"
import StationCard from "./StationCard"
import { RefreshCw, Activity } from "lucide-react"

export default function ProductionLine() {
  const [stations, setStations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    try {
      const [stationParts, productLogs] = await Promise.all([fetchStationParts(), fetchProductEntryLogs()])

      // Group station parts by station ID
      const stationMap = new Map()

      stationParts.forEach((part: any) => {
        if (!stationMap.has(part.stationId)) {
          stationMap.set(part.stationId, {
            id: part.stationId,
            name: `Station ${part.stationId}`,
            parts: [],
            currentProduct: null,
          })
        }
        stationMap.get(part.stationId).parts.push(part)
      })

      // Add current products to stations
      productLogs.forEach((log: any) => {
        if (stationMap.has(log.stationId)) {
          const station = stationMap.get(log.stationId)
          if (!station.currentProduct || new Date(log.timestamp) > new Date(station.currentProduct.timestamp)) {
            station.currentProduct = log
          }
        }
      })

      setStations(Array.from(stationMap.values()).sort((a, b) => a.id - b.id))
      setLastUpdate(new Date())
    } catch (error) {
      console.error("Error loading production line data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">Production Line Status</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">Last updated: {lastUpdate.toLocaleTimeString()}</div>
          <button onClick={loadData} disabled={loading} className="btn-primary flex items-center space-x-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {loading && stations.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-400">Loading production line data...</p>
          </div>
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Stations Found</h3>
          <p className="text-gray-500">No production stations are currently configured.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {stations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Production Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">{stations.length}</div>
                <div className="text-gray-300">Active Stations</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {stations.filter((s) => s.currentProduct).length}
                </div>
                <div className="text-gray-300">Stations with Products</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">
                  {stations.reduce(
                    (acc, station) =>
                      acc + station.parts.filter((part: any) => part.currentQuantity / part.binQuantity <= 0.2).length,
                    0,
                  )}
                </div>
                <div className="text-gray-300">Critical Parts</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
