export interface StationPart {
  id: number
  stationId: number
  partId: number
  productId?: number
  exceptionProductId?: number
  consumptionPerProduct: number
  binQuantity: number
  currentQuantity: number
  updatedAt: string
}

export interface ProductEntryLog {
  id: number
  productId: number
  stationId: number
  timestamp: string
}

export interface KanbanItem {
  id: number
  [key: string]: any
}

export interface Station {
  id: number
  name: string
  parts: StationPart[]
  currentProduct?: ProductEntryLog
}
