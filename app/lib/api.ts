import { stringify } from "querystring";
import { ActionResponse, ErrorResponse, FileUploadResponse, KanbanCreateRequest, KanbanItem, KanbanLogItem, KanbanLogResponse, KanbanModifyDetails, PreparationKanbanResponse, Product, QueryParams, RankPart, StationPart, SupplyKanbanResponse, User } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export async function fetchStationParts(): Promise<StationPart[]> {
  try {
    const response = await fetch(`${API_BASE}/station-parts`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch station parts")
    return await response.json()
  } catch (error) {
    console.error("Error fetching station parts:", error)
    return []
  }
}

export async function updateStationPart(id: number, updates: Partial<StationPart>): Promise<StationPart | ErrorResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/station-parts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      return { error: errorData?.error || "Failed to update station part" }
    }
    return await response.json()
  } catch (error) {
    console.error("Error updating station part:", error)
    return { error: "Error updating station part" }
  }
}

// Refeed a product at a station
export async function refeedProductAtStation(stationId: number, variant: string): Promise<{ message?: string, error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/product-entry-logs/refeed/${stationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ variant }),
    });
    const result = await response.json();
    if (!response.ok) {
      return { error: result?.error || "Failed to refeed product" };
    }
    return result;
  } catch (error) {
    console.error("Error refeeding product:", error);
    return { error: "Error refeeding product" };
  }
}

// Update a product entry log (only productId and timestamp)
export async function updateProductEntryLog(id: number, updates: { productId: number }): Promise<{ message?: string, error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/product-entry-logs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    const result = await response.json();
    if (!response.ok) {
      return { error: result?.error || "Failed to update product entry log" };
    }
    return result;
  } catch (error) {
    console.error("Error updating product entry log:", error);
    return { error: "Error updating product entry log" };
  }
}

// Delete a product entry log
export async function deleteProductEntryLog(id: number): Promise<{ message?: string, error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/product-entry-logs/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      return { error: result?.error || "Failed to delete product entry log" };
    }
    return result;
  } catch (error) {
    console.error("Error deleting product entry log:", error);
    return { error: "Error deleting product entry log" };
  }
}

export async function fetchProductEntryLogs(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/product-entry-logs`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch product entry logs")
    return await response.json()
  } catch (error) {
    console.error("Error fetching product entry logs:", error)
    return []
  }
}

export async function fetchPreparationKanbans(queryParams?: QueryParams): Promise<PreparationKanbanResponse | null> {
  try {
    let url = new URL(`${API_BASE}/preparation-sheet/kanbans`)
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    console.log("Fetching preparation kanbans with URL:", url.toString());
    
    const response = await fetch(url.toString(), {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch preparation kanbans")
    return await response.json()
  } catch (error) {
    console.error("Error fetching preparation kanbans:", error)
    return null
  }
}

export async function freezeProcess(process: string): Promise<ActionResponse> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanbans/freeze`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ process }),
    });

    const status = response.status;
    if (response.ok) {
      const data = await response.json().catch(() => null);
      return { status, data };
    } else {
      const errorData = await response.json().catch(() => null);
      return { status, error: errorData?.error || "Failed to freeze process" };
    }
  } catch (error: any) {
    console.error("Error freezing process:", error);
    return { status: 500, error: error.message || "Unknown error" };
  }
}

export async function unfreezeProcess(process: string): Promise<ActionResponse> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanbans/unfreeze`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ process }),
    });

    const status = response.status;
    if (response.ok) {
      const data = await response.json().catch(() => null);
      return { status, data };
    } else {
      const errorData = await response.json().catch(() => null);
      return { status, error: errorData?.error || "Failed to unfreeze process" };
    }
  } catch (error: any) {
    console.error("Error unfreezing process:", error);
    return { status: 500, error: error.message || "Unknown error" };
  }
}

export async function fetchPreparationKanbansCount(queryParams?: QueryParams): Promise<{ total: number } | null> {
  let url = new URL(`${API_BASE}/preparation-sheet/kanbans/count`)
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
  
  try {
    const response = await fetch(url.toString(), {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch preparation kanbans count")
    return await response.json()
  } catch (error) {
    console.error("Error fetching preparation kanbans count:", error)
    return null;
  }
}

export async function fetchSupplyKanbans(queryParams?: QueryParams): Promise<SupplyKanbanResponse | null> {
  let url = new URL(`${API_BASE}/supply-sheet/kanbans`)
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  try {
    const response = await fetch(url.toString(), {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch supply kanbans")
    return await response.json()
  } catch (error) {
    console.error("Error fetching supply kanbans:", error)
    return null;
  }
}

export async function fetchSupplyKanbansCount(queryParams?: QueryParams): Promise<{ total: number } | null> {
  let url = new URL(`${API_BASE}/supply-sheet/kanbans/count`)
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
  console.log("Fetching supply kanbans count with URL:", url.toString());
  
  try {
    const response = await fetch(url.toString(), {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch supply kanbans count")
    return await response.json()
  } catch (error) {
    console.error("Error fetching supply kanbans count:", error)
    return null;
  }
}

export async function fetchRankParts(): Promise<RankPart[]> {
  try {
    const response = await fetch(`${API_BASE}/parts/rank-parts`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch rank parts")
    return await response.json()
  } catch (error) {
    console.error("Error fetching rank parts:", error)
    return []
  }
}

export async function createPreparationKanban(newKanban:KanbanCreateRequest): Promise<boolean> {
  try {
    console.log("Creating new preparation kanban:", newKanban);
    
    const response = await fetch(`${API_BASE}/preparation-sheet/kanbans/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newKanban),
      credentials: "include",
    })
    console.log("Response:", response.json);
    
    return response.ok
  } catch (error) {
    console.error("Error updating preparation kanban:", error)
    return false
  }
}

export async function updatePreparationKanban(updateKanban:KanbanModifyDetails): Promise<boolean> {
  try {
    console.log("Updating preparation kanban:", updateKanban);
    
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateKanban),
      credentials: "include",
    })
    console.log("Response:", response.json);
    
    return response.ok
  } catch (error) {
    console.error("Error updating preparation kanban:", error)
    return false
  }
}

export async function updateAllPreparationKanban(process?: string | null): Promise<boolean> {
  try {
    console.log("Updating all preparation kanbans");
    
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban/all${process ? `?process=${process}` : ""}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    console.log("Response:", response.json);
    
    return response.ok
  } catch (error) {
    console.error("Error updating preparation kanbans:", error)
    return false
  }
}

export async function deletePreparationKanban(deleteKanban: KanbanModifyDetails): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deleteKanban),
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting preparation kanban:", error);
    return false;
  }
}

export async function deleteAllPreparationKanban(process?: string | null): Promise<boolean> {
  console.log("Deleting all preparation kanbans");
  
  try {
    const response = await fetch(`${API_BASE}/preparation-sheet/kanban${process ? `?process=${process}` : ""}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting preparation kanbans:", error);
    return false;
  }
}

export async function updateSupplyKanban(updateKanban:KanbanModifyDetails): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateKanban),
      credentials: "include",
    })
    return response.ok
  } catch (error) {
    console.error("Error updating supply kanban:", error)
    return false
  }
}

export async function updateAllSupplyKanban(process?: string | null): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban/all${process ? `?process=${process}` : ""}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
    return response.ok
  } catch (error) {
    console.error("Error updating supply kanbans:", error)
    return false
  }
}

export async function deleteSupplyKanban(deleteKanban: KanbanModifyDetails): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deleteKanban),
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting supply kanban:", error);
    return false
  }
}

export async function deleteAllSupplyKanban(process?: string | null): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/supply-sheet/kanban/all${process ? `?process=${process}` : ""}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting supply kanban:", error);
    return false
  }
}

export async function fetchProductVariants(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE}/product-variants`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch product variants")
    return await response.json()
  } catch (error) {
    console.error("Error fetching product variants:", error)
    return []
  }
}

export async function fetchStations(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/stations`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch stations")
    return await response.json()
  } catch (error) {
    console.error("Error fetching stations:", error)
    return []
  }
}

export async function fetchParts(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/parts`, {
      credentials: "include",
    })
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
      credentials: "include",
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    
    if (!response.ok) throw new Error("Authentication failed")
    console.log("Response from login:", response);
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
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    
    if (!response.ok) throw new Error("Logout failed")
    
    console.log("User logged out successfully")
  } catch (error) {
    console.error("Error logging out user:", error)
  }
}

export async function changePlant(plantId: number): Promise<User | ErrorResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/change-plant`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plantId }),
    })
    
    if (!response.ok) throw new Error("Change plant failed")
    return await response.json()
  } catch (error) {
    console.error("Error changing plant:", error)
    return null
  }
}

export async function fetchUserProfile(): Promise<User | ErrorResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    
    // if (!response.ok) throw new Error("Failed to fetch user profile")
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function fetchKanbanLogs(currentPage?:number, limit?:number): Promise<KanbanLogResponse | null> {
  const pageParam = currentPage ? `?page=${currentPage}` : ''
  const limitParam = limit ? `${currentPage ? '&' : '?'}limit=${limit}` : ''
  try {
    const response = await fetch(`${API_BASE}/kanban-logs${pageParam}${limitParam}`, {
      credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to fetch kanban logs")
    return await response.json()
  } catch (error) {
    console.error("Error fetching kanban logs:", error)
    return null;
  }
}

export const uploadFile = async (file:File, onProgress: (progress: number)=> void) => {
  const CHUNK_SIZE = 1 * 1024 * 1024;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${file.name}-${Date.now()}`;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk: Blob = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('fileName', file.name);
    formData.append('fileId', fileId);
    formData.append('chunkIndex', chunkIndex as unknown as string);
    formData.append('totalChunks', totalChunks as unknown as string);

    try {
      const response = await fetch(`${API_BASE}/upload/excel-update`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });
      const data: FileUploadResponse = await response.json();
      if (!response.ok) throw new Error(`${data.error}`);
      const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      onProgress(percent);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}