export interface StationPart {
  id: number
  stationId: number
  stationName: string
  partId: number
  partIdNo: string
  partName: string
  productId?: number
  productName?: string 
  exceptionProductId?: number
  exceptionProductName?: string 
  consumptionPerProduct: number
  binQuantity: number
  currentQuantity: number
  process: string
  prepLocation: string
  supplyLocation: string
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
  partId: number
  partIdNo: number
  partName: string
  process: number
  prepLocation?: string
  supplyLocation?: string
  requestedAt?: string | Date // ISO timestamp
  acknowledgedAt?: string | Date // ISO timestamp or undefined
  acknowledgedByLogistics?: boolean
  fulfilled?: boolean
  fulfilledAt?: string | Date // ISO timestamp or undefined
  productId?: number
}

export interface KanbanLogItem {
  id: number
  plantId:number
  plantName?: string
  stationId: number
  stationName: string
  partId: number
  partIdNo: number
  partName: string
  process: number
  prepLocation?: string
  supplyLocation?: string
  productId: number
  productName: string 
  requestedAt: string | Date // ISO timestamp
  acknowledgedByLogistics: boolean
  acknowledgedAt?: string | Date // ISO timestamp or undefined
  fulfilled: boolean
  fulfilledAt?: string | Date // ISO timestamp or undefined
}

export interface KanbanLogResponse {
  logs: KanbanLogItem[]
  totalPages: number
}

export interface PreparationKanbanResponse {
  kanbans: KanbanItem[]
  processes: string[]
  isFrozenData: boolean
  total: number
  totalPages: number
}

export interface SupplyKanbanResponse {
  kanbans: KanbanItem[]
  processes: string[]
  total: number
  totalPages: number
}

export interface Station {
  id: number
  name: string
  sequenceNo: number
  parts: StationPart[]
  currentProduct?: ProductEntryLog
}

export interface Product {
  id: number
  variant: string
}

export interface StationsCurrentStatus {
  id: number
  name: string
  parts: Array<StationPart>
  currentProduct?: ProductEntryLog
}

export interface KanbanCreateRequest {
  stationPartIds?: string[]
  rankPartIds?: string[]
  // station: string
  // part: string
  // process: string
  // supplyLocation: string
}

export interface KanbanModifyDetails {
  kanbanIds: number[]
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

export interface ActionResponse { 
  status: number; 
  data?: any; 
  error?: string 
}

export interface FileUploadResponse {
  success: boolean;
  message?: string;
  error?: string; 
}

export interface QueryParams {
  process?: string | null
  search?: string | null
  page?: number
  limit?: number
}

export interface KanbanLogQueryParams extends QueryParams {
  status?: "all" | "requested" | "acknowledged" | "fulfilled" 
  dateTime?: string | null
}

export interface RankPart{
  id: number | null;
  partId: string | null;
}