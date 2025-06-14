import { Package, AlertTriangle, CheckCircle, KanbanSquare } from "lucide-react"
import type { StationsCurrentStatus } from "../lib/types"

interface StationCardProps {
  station: StationsCurrentStatus
  refilledParts?: Set<string>
}

export default function StationCard({ station, refilledParts = new Set() }: StationCardProps) {
  const getQuantityStatus = (current: number, bin: number) => {
    const percentage = (current / bin) * 100
    if (percentage <= 20) return "critical"
    if (percentage <= 50) return "warning"
    return "good"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-400 bg-red-900/20"
      case "warning":
        return "text-yellow-400 bg-yellow-900/20"
      default:
        return "text-green-400 bg-green-900/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const isPartRefilled = (partId: number) => {
    return refilledParts.has(`${station.id}-${partId}`)
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{station.name}</h3>
      </div>

      {station.currentProduct && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 font-medium">Variant {station.currentProduct.productName}</span>
          </div>
          <div className="text-xs text-blue-400 mt-1">
            {new Date(station.currentProduct.timestamp).toLocaleString()}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Parts Inventory:</h4>
        {station.parts.length === 0 ? (
          <div className="text-gray-500 text-sm">No parts assigned</div>
        ) : (
          station.parts.map((part) => {
            const status = getQuantityStatus(part.currentQuantity, part.binQuantity)
            const isRefilled = isPartRefilled(part.id)
            return (
              <div
                key={part.id}
                className={`flex items-center justify-between p-2 rounded border ${getStatusColor(status)} ${isRefilled ? "ring-2 ring-blue-400" : ""}`}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium">Part {part.partName}</span>
                  {isRefilled && (
                    <KanbanSquare className="h-4 w-4 text-blue-400 animate-pulse" title="Recently refilled" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {part.currentQuantity}/{part.binQuantity}
                  </div>
                  <div className="text-xs opacity-75">Consumption: {part.consumptionPerProduct}/unit</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
