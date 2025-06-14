export interface StationPart {
  id: number
  stationId: number
  stationName: string
  partId: number
  partName: string
  productId?: number
  productName?: string 
  exceptionProductId?: number
  exceptionProductName?: string 
  consumptionPerProduct: number
  binQuantity: number
  currentQuantity: number
  updatedAt: string
}

export interface ProductEntryLog {
  id: number
  productId: number
  productName: string 
  stationId: number
  stationName: string
  timestamp: string
}

export interface KanbanItem {
  id: number
  plantId:number
  plantName?: string
  stationId: number
  stationName: string
  partId: number
  partName: string
  productId: number
  productName: string 
  requestedAt: string | Date // ISO timestamp
  acknowledgedByLogistics: boolean
  acknowledgedAt?: string | Date // ISO timestamp or undefined
  fulfilled: boolean
  fulfilledAt?: string | Date // ISO timestamp or undefined
}

export interface Station {
  id: number
  name: string
  parts: StationPart[]
  currentProduct?: ProductEntryLog
}

export interface StationsCurrentStatus {
  id: number
  name: string
  parts: Array<StationPart>
  currentProduct?: ProductEntryLog
}

export interface KanbanModifyDetails {
  plantId:number 
  stationId:number 
  partId:number 
  productId: number
}

export interface ErrorResponse {
  error: string
}

export interface User {
  id: number
  username: string
  role: "admin" | "logistics" | "supplier"
  plantId?: number | null
  plantName?: string | null
}
