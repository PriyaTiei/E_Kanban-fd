"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  fetchStationParts,
  fetchProductEntryLogs,
  fetchProductVariants,
  updateStationPart,
  updateProductEntryLog,
  deleteProductEntryLog,
  refeedProductAtStation,
} from "../lib/api"
import type { StationPart, ProductEntryLog, Product } from "../lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, RefreshCw, Save, Package, AlertTriangle, CheckCircle, PackagePlus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

interface EditableStationPart extends StationPart {
  isEdited?: boolean
}

interface EditableProductLog extends ProductEntryLog {
  isEdited?: boolean
}

interface StationData {
  id: number
  name: string
  parts: EditableStationPart[]
  currentProduct?: EditableProductLog
}

export default function EditStations() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stations, setStations] = useState<StationData[]>([])
  const [productVariants, setProductVariants] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<{ [key: string]: boolean }>({})
  const [refeed, setRefeed] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (!user) return
    if (user.role !== "admin") {
      router.push("/")
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      const [stationPartsData, productLogsData, variantsData] = await Promise.all([
        fetchStationParts(),
        fetchProductEntryLogs(),
        fetchProductVariants(),
      ])

      setProductVariants(variantsData)

      // Group station parts by station
      const stationMap = new Map<number, StationData>()

      stationPartsData.forEach((part: StationPart) => {
        if (!stationMap.has(part.stationId)) {
          stationMap.set(part.stationId, {
            id: part.stationId,
            name: part.stationName,
            parts: [],
          })
        }
        stationMap.get(part.stationId)!.parts.push(part)
      })

      // Add current products to stations
      productLogsData.forEach((log: ProductEntryLog) => {
        const station = stationMap.get(log.stationId)
        if (station) {
          station.currentProduct = log
        }
      })

      setStations(Array.from(stationMap.values()))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load station data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePartField = (stationId: number, partId: number, field: keyof StationPart, value: any) => {
    setStations((prev) =>
      prev.map((station) => {
        if (station.id === stationId) {
          return {
            ...station,
            parts: station.parts.map((part) => {
              if (part.id === partId) {
                return { ...part, [field]: value, isEdited: true }
              }
              return part
            }),
          }
        }
        return station
      }),
    )
  }

  const updateProductField = (stationId: number, field: keyof ProductEntryLog, value: any) => {
    setStations((prev) =>
      prev.map((station) => {
        if (station.id === stationId && station.currentProduct) {
          return {
            ...station,
            currentProduct: { ...station.currentProduct, [field]: value, isEdited: true },
          }
        }
        return station
      }),
    )
  }

  const savePart = async (stationId: number, part: EditableStationPart) => {
    const saveKey = `part-${part.id}`
    setSaving((prev) => ({ ...prev, [saveKey]: true }))

    try {
      const updates = {
        currentQuantity: Number(part.currentQuantity),
        binQuantity: Number(part.binQuantity),
        consumptionPerProduct: Number(part.consumptionPerProduct),
      }

      const result = await updateStationPart(part.id, updates)

      if (result && "error" in result) {
        throw new Error(result.error)
      }

      setStations((prev) =>
        prev.map((station) => {
          if (station.id === stationId) {
            return {
              ...station,
              parts: station.parts.map((p) => {
                if (p.id === part.id) {
                  return { ...p, isEdited: false }
                }
                return p
              }),
            }
          }
          return station
        }),
      )

      toast({
        title: "Success",
        description: "Part updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update part",
        variant: "destructive",
      })
    } finally {
      setSaving((prev) => ({ ...prev, [saveKey]: false }))
    }
  }

  const saveProduct = async (stationId: number, product: EditableProductLog) => {
    const saveKey = `product-${product.id}`
    setSaving((prev) => ({ ...prev, [saveKey]: true }))

    try {
      const result = await updateProductEntryLog(product.id, {
        productId: Number(product.productId),
      })

      if (result.error) {
        throw new Error(result.error)
      }

      setStations((prev) =>
        prev.map((station) => {
          if (station.id === stationId && station.currentProduct) {
            return {
              ...station,
              currentProduct: { ...station.currentProduct, isEdited: false },
            }
          }
          return station
        }),
      )

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSaving((prev) => ({ ...prev, [saveKey]: false }))
    }
  }

  const deleteProduct = async (stationId: number, productId: number) => {
    try {
      const result = await deleteProductEntryLog(productId)

      if (result.error) {
        throw new Error(result.error)
      }

      setStations((prev) =>
        prev.map((station) => {
          if (station.id === stationId) {
            return { ...station, currentProduct: undefined }
          }
          return station
        }),
      )

      toast({
        title: "Success",
        description: "Product removed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove product",
        variant: "destructive",
      })
    }
  }

  const refeedProduct = async (stationId: number, variant: string) => {
    const saveKey = `refeed-${stationId}`
    setSaving((prev) => ({ ...prev, [saveKey]: true }))

    try {
      const result = await refeedProductAtStation(stationId, variant)

      if (result.error) {
        throw new Error(result.error)
      }

      // Reload data to get the updated product
      await loadData()
      setRefeed((prev) => ({ ...prev, [stationId]: !prev[stationId] }))

      toast({
        title: "Success",
        description: "Product refed successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to refeed product",
        variant: "destructive",
      })
    } finally {
      setSaving((prev) => ({ ...prev, [saveKey]: false }))
    }
  }

  const getQuantityStatus = (current: number, consumption: number) => {
    if (consumption <= 0) return "good"
    const cyclesLeft = current / consumption
    if (cyclesLeft <= 2) return "critical"
    if (cyclesLeft <= 5) return "warning"
    return "good"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-green-400"
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

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:ml-12 md:ml-0">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading stations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Edit Stations</h1>
        <button onClick={loadData} className="btn-primary flex items-center">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5">
        {stations.map((station) => (
          <Card key={station.id} className="w-full bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                {station.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-6">
              {/* Current Product Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h3 className="text-lg font-semibold text-gray-300">Current Product</h3>
                  {
                    <Button
                      onClick={() => setRefeed((prev) => ({ ...prev, [station.id]: !prev[station.id] }))}
                      size="sm"
                      className={`${!refeed[station.id] ? "bg-blue-600 hover:bg-blue-700" : "bg-red-500 hover:bg-red-600"} text-white`}
                    >
                      {!refeed[station.id] ?
                        <PackagePlus className="h-4 w-4 mr-1" />
                      :
                        <X className="h-4 w-4 mr-1" />
                      }
                      {!refeed[station.id] ? "Refeed" : "Cancel"}
                    </Button>
                  }
                </div>
                {station.currentProduct && !refeed[station.id] ? (
                  <div className="bg-gray-700/50 p-4 rounded-lg space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <Label htmlFor={`product-${station.id}`} className="text-gray-300">
                          Product Variant
                        </Label>
                        <Select
                          value={station.currentProduct.productId.toString()}
                          onValueChange={(value) => updateProductField(station.id, "productId", Number(value))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {productVariants.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                Variant {product.variant}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-wrap sm:flex-col gap-2">
                        <Button
                          onClick={() => saveProduct(station.id, station.currentProduct!)}
                          disabled={!station.currentProduct.isEdited || saving[`product-${station.currentProduct.id}`]}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Remove Product</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to remove this product from the station?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProduct(station.id, station.currentProduct!.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Last updated: {new Date(station.currentProduct.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-400 mb-4">
                      { !refeed[station.id] ?
                        "No product currently at this station"
                      :
                        "Select the reworked variant to refeed at this station"
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <Label className="text-gray-300">Refeed Variant</Label>
                        <Select onValueChange={(value) => refeedProduct(station.id, value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Select variant to refeed" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {productVariants.map((product) => (
                              <SelectItem key={product.id} value={product.variant}>
                                Variant {product.variant}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="bg-gray-600" />

              {/* Parts Section */}
              <div className="w-full space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Parts Inventory</h3>
                {station.parts.length === 0 ? (
                  <p className="text-gray-400">No parts assigned to this station</p>
                ) : (
                  <div className="w-full grid gap-4">
                    {station.parts
                      .slice()
                      .sort((a, b) => {
                        const aCycles =
                          a.consumptionPerProduct > 0
                            ? a.currentQuantity / a.consumptionPerProduct
                            : Number.POSITIVE_INFINITY
                        const bCycles =
                          b.consumptionPerProduct > 0
                            ? b.currentQuantity / b.consumptionPerProduct
                            : Number.POSITIVE_INFINITY
                        return aCycles - bCycles
                      })
                      .map((part) => {
                        const status = getQuantityStatus(part.currentQuantity, part.consumptionPerProduct)
                        return (
                          <div key={part.id} className="w-full bg-gray-700/50 p-4 rounded-lg space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getStatusIcon(status)}
                              <h4 className="font-medium text-white">Part {part.partName}</h4>
                              <Badge variant="outline" className={`${getStatusColor(status)} border-current text-xs`}>
                                {part.consumptionPerProduct > 0
                                  ? `${Math.round(part.currentQuantity / part.consumptionPerProduct)} cycles left`
                                  : "No consumption"}
                              </Badge>
                              {part.isEdited && (
                                <Badge variant="secondary" className="bg-yellow-500 text-xs text-white">
                                  Modified
                                </Badge>
                              )}
                            </div>

                            <div className="w-full flex flex-wrap gap-4">
                              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                <div>
                                  <Label htmlFor={`current-${part.id}`} className="text-xs text-gray-300">
                                    Current Quantity
                                  </Label>
                                  <Input
                                    id={`current-${part.id}`}
                                    type="number"
                                    value={part.currentQuantity}
                                    onChange={(e) =>
                                      updatePartField(station.id, part.id, "currentQuantity", Number(e.target.value))
                                    }
                                    className="w-full bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`bin-${part.id}`} className="text-xs text-gray-300">
                                    Bin Quantity
                                  </Label>
                                  <Input
                                    id={`bin-${part.id}`}
                                    type="number"
                                    value={part.binQuantity}
                                    onChange={(e) =>
                                      updatePartField(station.id, part.id, "binQuantity", Number(e.target.value))
                                    }
                                    className="w-full bg-gray-800 border-gray-600 text-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label htmlFor={`consumption-${part.id}`} className="text-xs text-gray-300">
                                  Consumption/Product
                                </Label>
                                <Input
                                  id={`consumption-${part.id}`}
                                  type="number"
                                  step="0.1"
                                  value={part.consumptionPerProduct}
                                  onChange={(e) =>
                                    updatePartField(
                                      station.id,
                                      part.id,
                                      "consumptionPerProduct",
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-full bg-gray-800 border-gray-600 text-white"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <Button
                                onClick={() => savePart(station.id, part)}
                                disabled={!part.isEdited || saving[`part-${part.id}`]}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Save className="h-4 w-4 mr-1" />
                                {saving[`part-${part.id}`] ? "Saving..." : "Save Part"}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
