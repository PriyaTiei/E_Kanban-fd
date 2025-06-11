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

export async function updatePreparationKanban(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return response.ok
  } catch (error) {
    console.error("Error updating preparation kanban:", error)
    return false
  }
}

export async function deletePreparationKanban(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return response.ok
  } catch (error) {
    console.error("Error deleting preparation kanban:", error)
    return false
  }
}

export async function updateSupplyKanban(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return response.ok
  } catch (error) {
    console.error("Error updating supply kanban:", error)
    return false
  }
}

export async function deleteSupplyKanban(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return response.ok
  } catch (error) {
    console.error("Error deleting supply kanban:", error)
    return false
  }
}
