"use client"

import { useEffect, useState } from "react"
import {
  fetchStationParts,
  fetchProductEntryLogs,
  simulateGDSensorTrigger,
  fetchPreparationKanbansCount,
  fetchSupplyKanbansCount,
  fetchStations,
} from "../lib/api"
import StationCard from "./StationCard"
import { RefreshCw, Activity, Computer } from "lucide-react"
import type { ProductEntryLog, Station, StationPart, StationsCurrentStatus } from "../lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../contexts/AuthContext"

export default function ProductionLine() {
  const { user } = useAuth()
  const [stations, setStations] = useState<StationsCurrentStatus[]>([])
  const [kanbansToPrepare, setKanbansToPrepare] = useState<null | number>(null)
  const [kanbansToSupply, setKanbansToSupply] = useState<null | number>(null)
  const [loading, setLoading] = useState(true)
  const [countLoading, setCountLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<null | Date>(null)
  const [previousCriticalParts, setPreviousCriticalParts] = useState<Set<string>>(new Set())
  const [refilledParts, setRefilledParts] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const [stationParts, stations, productLogs]: [
        stationParts: StationPart[],
        stations: Station[],
        productLogs: ProductEntryLog[],
      ] = await Promise.all([fetchStationParts(), fetchStations(), fetchProductEntryLogs()])

      // Group station parts by station ID
      const stationMap = new Map()

      stationParts.forEach((part) => {
        if (!stationMap.has(part.stationId)) {
          stationMap.set(part.stationId, {
            id: part.stationId,
            name: `Station ${part.stationName}`,
            parts: [],
            currentProduct: null,
          })
        }
        stationMap.get(part.stationId).parts.push(part)
      })

      // Add any missing stations from stations array
      stations.forEach((station) => {
        if (!stationMap.has(station.id)) {
          stationMap.set(station.id, {
            id: station.id,
            name: `Station ${station.name}`,
            parts: [],
            currentProduct: null,
          })
        }
      })

      // Add current products to stations
      productLogs.forEach((log) => {
        if (stationMap.has(log.stationId)) {
          const station = stationMap.get(log.stationId)
          if (!station.currentProduct || new Date(log.timestamp) > new Date(station.currentProduct.timestamp)) {
            station.currentProduct = log
          }
        }
      })

      const newStations = Array.from(stationMap.values()).sort((a, b) => a.id - b.id)

      // Check for refilled critical parts
      const currentCriticalParts = new Set<string>()
      const newRefilledParts = new Set<string>()
      let refilledPartsNames = "";

      newStations.forEach((station) => {
        station.parts.forEach((part: any) => {
          const partKey = `${station.id}-${part.id}`
          const isCritical = part.currentQuantity / part.binQuantity <= 0.2

          if (isCritical) {
            currentCriticalParts.add(partKey)
          } else if (previousCriticalParts.has(partKey)) {
            // Part was critical but now is not - it was refilled
            newRefilledParts.add(partKey)
            refilledPartsNames += `${part.partName} at ${station.name},`;
          }
        })
      })
      
      refilledPartsNames && toast({
        title: "Part Refilled",
        description: `${refilledPartsNames.slice(0,refilledPartsNames.length - 1)} has been refilled!`,
      })
      setPreviousCriticalParts(currentCriticalParts)
      setRefilledParts(newRefilledParts)
      setStations(newStations)
      setLastUpdate(new Date())

      // Clear refilled parts indicator after next refresh
      setTimeout(() => {
        setRefilledParts(new Set())
      }, 30000) // Clear after 30 seconds
    } catch (error) {
      console.error("Error loading production line data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCounts = async () => {
    setCountLoading(true)
    try {
      const [kanbansToPrepare, kanbansToSupply] = await Promise.all([
        fetchPreparationKanbansCount(),
        fetchSupplyKanbansCount(),
      ])
      console.log("Kanbans to prepare:", kanbansToPrepare, "Kanbans to supply:", kanbansToSupply)

      setKanbansToPrepare(kanbansToPrepare.total || 0)
      setKanbansToSupply(kanbansToSupply.total || 0)
    } catch (error) {
      console.error("Error loading kanban counts:", error)
    } finally {
      setCountLoading(false)
    }
  }

  const handleSimulate = async () => {
    // Simulate a product entry log for demonstration purposes
    const variants = [328, 319, 425]
    const randomVariant = variants[Math.floor(Math.random() * variants.length)]
    const simulatedProductEntry = {
      variant: randomVariant,
    }

    try {
      const response = await simulateGDSensorTrigger(simulatedProductEntry)
      if (response) {
        console.log("Product entry log simulated successfully")
        loadData() // Reload data after simulation
      } else {
        console.error("Failed to simulate product entry log")
        toast({
          title: "Simulation Failed",
          description: "Failed to simulate product entry",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error simulating product entry log:", error)
      toast({
        title: "Simulation Error",
        description: "An error occurred during simulation",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    loadData()
    loadCounts()
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData()
      loadCounts()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-2 mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 md:h-8 md:w-8 text-blue-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Production Line Status</h1>
          </div>

          <div className="w-full md:w-fit flex justify-between md:justify-end items-center space-x-4">
            {user?.role === "admin" &&
              <button onClick={handleSimulate} className="btn-primary flex items-center space-x-2">
                <Computer className="h-4 w-4" />
                <span className="text-sm md:text-base">Simulate</span>
              </button>
            }
            <button onClick={loadData} disabled={loading} className="btn-primary flex items-center space-x-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="text-sm md:text-base">Refresh</span>
            </button>
          </div>
        </div>
        <div className="text-xs md:text-sm inline-flex self-end items-center gap-1 text-gray-400">
          Last updated:
          {lastUpdate ? (
            <span>{lastUpdate?.toLocaleTimeString()}</span>
          ) : (
            <div className="h-4 w-20 bg-gray-600 rounded animate-pulse" />
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {stations.map((station) => (
              <StationCard key={station.id} station={station} refilledParts={refilledParts} />
            ))}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4">Production Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 flex flex-col gap-2 md:gap-4 rounded-lg p-4">
                {countLoading ? (
                  <div className="h-8 w-20 bg-gray-600 rounded animate-pulse mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-blue-400">{kanbansToPrepare}</div>
                )}
                <div className="text-sm md:text-base text-gray-300">Total Kanbans To Prepare</div>
              </div>
              <div className="bg-gray-700 flex flex-col gap-2 md:gap-4 rounded-lg p-4">
                {countLoading ? (
                  <div className="h-8 w-20 bg-gray-600 rounded animate-pulse mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-green-400">{kanbansToSupply}</div>
                )}
                <div className="text-sm md:text-base text-gray-300">Total Kanbans To Supply</div>
              </div>
              <div className="bg-gray-700 flex flex-col gap-2 md:gap-4 rounded-lg p-4">
                <div className="flex items-center gap-6">
                  <div className="text-2xl font-bold text-red-400">
                    {stations.reduce(
                      (acc, station) =>
                        acc +
                        station.parts.filter((part: any) => part.currentQuantity / part.binQuantity <= 0.2).length,
                      0,
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
                    {stations
                      .filter((station) =>
                        station.parts.some((part: any) => part.currentQuantity / part.binQuantity <= 0.2),
                      )
                      .map((station) => (
                        <div key={station.id} className="w-max p-2 border border-red-300 rounded-md text-xs text-red-300">
                          {station.name.split(" ")[1]}
                        </div>
                      ))}
                  </div>
                </div>
                <div className="text-sm md:text-base text-gray-300">Critical Parts</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
