import { ErrorResponse, KanbanItem, KanbanModifyDetails, User } from "./types"

const API_BASE = "http://10.82.126.73:3058"

export async function fetchStationParts(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/station-parts`)
    if (!response.ok) throw new Error("Failed to fetch station parts")
    return await response.json()
  } catch (error) {
    console.error("Error fetching station parts:", error)
    return []
  }
}

export async function fetchProductEntryLogs(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/product-entry-logs`)
    if (!response.ok) throw new Error("Failed to fetch product entry logs")
    return await response.json()
  } catch (error) {
    console.error("Error fetching product entry logs:", error)
    return []
  }
}

export async function fetchPreparationKanbans(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanbans`)
    if (!response.ok) throw new Error("Failed to fetch preparation kanbans")
    return await response.json()
  } catch (error) {
    console.error("Error fetching preparation kanbans:", error)
    return []
  }
}

export async function fetchPreparationKanbansCount() {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanbans/count`)
    if (!response.ok) throw new Error("Failed to fetch preparation kanbans count")
    return await response.json()
  } catch (error) {
    console.error("Error fetching preparation kanbans count:", error)
    return []
  }
}

export async function fetchSupplyKanbans(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanbans`)
    if (!response.ok) throw new Error("Failed to fetch supply kanbans")
    return await response.json()
  } catch (error) {
    console.error("Error fetching supply kanbans:", error)
    return []
  }
}

export async function fetchSupplyKanbansCount() {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanbans/count`)
    if (!response.ok) throw new Error("Failed to fetch supply kanbans count")
    return await response.json()
  } catch (error) {
    console.error("Error fetching supply kanbans count:", error)
    return []
  }
}

export async function updatePreparationKanban(updateKanban:KanbanModifyDetails): Promise<boolean> {
  try {
    console.log("Updating preparation kanban:", updateKanban);
    
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateKanban),
    })
    console.log("Response:", response.json);
    
    return response.ok
  } catch (error) {
    console.error("Error updating preparation kanban:", error)
    return false
  }
}

export async function deletePreparationKanban(deleteKanban: KanbanModifyDetails): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      plantId: String(deleteKanban.plantId),
      stationId: String(deleteKanban.stationId),
      partId: String(deleteKanban.partId),
      productId: String(deleteKanban.productId),
    }).toString();

    const response = await fetch(`${API_BASE}/preparation-sheet/kanban?${params}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting preparation kanban:", error);
    return false;
  }
}

export async function updateSupplyKanban(updateKanban:KanbanModifyDetails): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateKanban),
    })
    return response.ok
  } catch (error) {
    console.error("Error updating supply kanban:", error)
    return false
  }
}

export async function deleteSupplyKanban(deleteKanban: KanbanModifyDetails): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      plantId: String(deleteKanban.plantId),
      stationId: String(deleteKanban.stationId),
      partId: String(deleteKanban.partId),
      productId: String(deleteKanban.productId),
    }).toString();

    const response = await fetch(`${API_BASE}/supply-sheet/kanban?${params}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting supply kanban:", error);
    return false
  }
}

export async function fetchProductVariants(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/product-variants`)
    if (!response.ok) throw new Error("Failed to fetch product variants")
    return await response.json()
  } catch (error) {
    console.error("Error fetching product variants:", error)
    return []
  }
}

export async function fetchStations(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/stations`)
    if (!response.ok) throw new Error("Failed to fetch stations")
    return await response.json()
  } catch (error) {
    console.error("Error fetching stations:", error)
    return []
  }
}

export async function fetchParts(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/parts`)
    if (!response.ok) throw new Error("Failed to fetch parts")
    return await response.json()
  } catch (error) {
    console.error("Error fetching parts:", error)
    return []
  }
}

export async function simulateGDSensorTrigger(product:{variant: number}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/sensor-trigger/gd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
    console.log("Simulating sensor trigger with variant:", response);
    
    return response.ok
  } catch (error) {
    console.error("Error updating station part:", error)
    return false
  }
}


export async function loginUser(username: string, password: string): Promise<User | ErrorResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    
    if (!response.ok) throw new Error("Authentication failed")
    
    return await response.json()
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) throw new Error("Logout failed")
    
    console.log("User logged out successfully")
  } catch (error) {
    console.error("Error logging out user:", error)
  }
}

export async function fetchUserProfile(): Promise<User | ErrorResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) throw new Error("Failed to fetch user profile")
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function fetchKanbanLogs(): Promise<KanbanItem[]> {
  try {
    const response = await fetch(`${API_BASE}/kanban-logs`)
    if (!response.ok) throw new Error("Failed to fetch kanban logs")
    return await response.json()
  } catch (error) {
    console.error("Error fetching kanban logs:", error)
    return []
  }
}
