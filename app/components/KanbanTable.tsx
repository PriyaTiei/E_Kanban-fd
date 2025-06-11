"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"

interface KanbanTableProps {
  data: any[]
  onUpdate: (id: number) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
  title: string
}

export default function KanbanTable({ data, onUpdate, onDelete, title }: KanbanTableProps) {
  const [loading, setLoading] = useState<{ [key: number]: "update" | "delete" | null }>({})

  const handleAction = async (id: number, action: "update" | "delete") => {
    setLoading((prev) => ({ ...prev, [id]: action }))

    try {
      const success = action === "update" ? await onUpdate(id) : await onDelete(id)
      if (success) {
        // Refresh the page or update the data
        window.location.reload()
      } else {
        alert(`Failed to ${action} kanban item`)
      }
    } catch (error) {
      console.error(`Error ${action}ing kanban:`, error)
      alert(`Error ${action}ing kanban item`)
    } finally {
      setLoading((prev) => ({ ...prev, [id]: null }))
    }
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="text-center py-8 text-gray-400">No data available</div>
      </div>
    )
  }

  const columns = Object.keys(data[0]).filter((key) => key !== "id")

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
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
                      {typeof item[column] === "object" ? JSON.stringify(item[column]) : String(item[column] || "-")}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleAction(item.id, "update")}
                        disabled={loading[item.id] !== null}
                        className="btn-success flex items-center justify-center w-8 h-8"
                        title="Approve"
                      >
                        {loading[item.id] === "update" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "delete")}
                        disabled={loading[item.id] !== null}
                        className="btn-danger flex items-center justify-center w-8 h-8"
                        title="Reject"
                      >
                        {loading[item.id] === "delete" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </button>
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
