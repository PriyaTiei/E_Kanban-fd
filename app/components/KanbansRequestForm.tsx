import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createPreparationKanban, fetchRankParts, fetchStationParts } from "../lib/api";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RankPart, StationPart } from "../lib/types";
import SearchBar from "./SearchBar";

function KanbanRequestsForm({
  requestFormOpen,
  setRequestFormOpen,
}: {
  requestFormOpen: boolean;
  setRequestFormOpen: (open: boolean) => void;
}) {
  const [stationParts, setStationParts] = useState<Record<string, Pick<StationPart, 'id' | 'partIdNo'>[]>>({});
  const [originalStationParts, setOriginalStationParts] = useState<Record<string, Pick<StationPart, 'id' | 'partIdNo'>[]>>({});
  const [rankParts, setRankParts] = useState<RankPart[]>([]);
  const [originalRankParts, setOriginalRankParts] = useState<RankPart[]>([]);
  const [showRankParts, setShowRankParts] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track selected stations and parts with quantities
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());
  const [selectedParts, setSelectedParts] = useState<Record<string, Record<string, number>>>({});

  // Fetch stations and parts only once when dialog opens
  useEffect(() => {
    if (!requestFormOpen) return;

    const fetchParts = async () => {
      setFormLoading(true);
      try {
        const parts = await fetchStationParts();
        const rankParts = await fetchRankParts();
        if (!parts || parts.length === 0) {
          setError("No station parts found.");
          return;
        }
        if (rankParts && rankParts.length !== 0) {
          setRankParts(rankParts.filter(rp => rp.partId && rp.id).sort((a, b) => {
            if (a.partId && b.partId) {
              const numA = Number(a.partId);
              const numB = Number(b.partId);
              return numA - numB;
            }
            return 0;
          }));
        }

        const stationPartMap: Record<string, Pick<StationPart, 'id' | 'partIdNo'>[]> = parts.reduce((acc, stationPart) => {
          const stationName = stationPart.stationName;
          if (!acc[stationName]) {
            acc[stationName] = [];
          }
          acc[stationName].push({
            partIdNo: stationPart.partIdNo,
            id: stationPart.id,
          });
          return acc;
        }, {} as Record<string, Pick<StationPart, 'id' | 'partIdNo'>[]>);

        setStationParts(stationPartMap);
        setOriginalStationParts(stationPartMap);
        setOriginalRankParts(rankParts);
        console.log("Station parts mapped by station:", stationPartMap);
      } catch (err) {
        if (err instanceof Error)
          setError(`Error fetching station parts: ${err.message}`);
      } finally {
        setFormLoading(false);
      }
    };

    fetchParts();
  }, [requestFormOpen]);

  const handleDialogClose = () => {
    setRequestFormOpen(false);
    setError(null);
    setSelectedStations(new Set());
    setSelectedParts({});
  };

  const handleSearchFilter = (search: string | null) => {
    console.log("Search filter in Kanban Request Form:", search);
    if (!search || search.trim() === "") {
      // Reset to original data when search is cleared
      setStationParts(originalStationParts);
      setRankParts(originalRankParts);
      setSelectedStations(new Set());
      setSelectedParts({});
      return;
    }

    const lowerSearch = search.toLowerCase();

    // Filter stationParts based on search (partial match for display)
    const filteredStationParts: Record<string, Pick<StationPart, 'id' | 'partIdNo'>[]> = {};
    const newSelectedStations = new Set<string>();
    const newSelectedPart: Record<string, Record<string, number>> = {};
    
    Object.entries(originalStationParts).forEach(([station, parts]) => {
      const matchingParts = parts.filter(part => part.partIdNo.toLowerCase().includes(lowerSearch));
      // Initialize quantity map for this station
      newSelectedPart[station] = {};
      // Only auto-select if exact match
      parts.filter(part => lowerSearch === part.partIdNo.toLowerCase()).forEach(part => {
        newSelectedPart[station][String(part.id)] = 1;
      });
      if (matchingParts.length > 0) {
        newSelectedStations.add(station);
        filteredStationParts[station] = matchingParts;
      }
    });

    // Filter rankParts based on search (partial match for display)
    const filteredRankParts = originalRankParts.filter(part => 
      part.partId && part.partId.toLowerCase().includes(lowerSearch)
    );
    
    // Only auto-select if exact match for rank parts
    newSelectedPart["Rank Parts"] = {};
    filteredRankParts.filter(part => part.partId && lowerSearch === part.partId.toLowerCase()).forEach(part => {
      newSelectedPart["Rank Parts"][String(part.id)] = 1;
    });
    
    if (filteredRankParts.length > 0) {
      newSelectedStations.add("Rank Parts");
    }

    setStationParts(filteredStationParts);
    setRankParts(filteredRankParts);
    setSelectedStations(newSelectedStations);
    setSelectedParts(newSelectedPart);
  }

  const toggleStation = (station: string) => {
    const newStations = new Set(selectedStations);
    if (newStations.has(station)) {
      newStations.delete(station);
      // also remove its parts if station unchecked
      const newParts = { ...selectedParts };
      delete newParts[station];
      setSelectedParts(newParts);
    } else {
      newStations.add(station);
    }
    setSelectedStations(newStations);
  };

  const togglePart = (station: string, partId: string, quantity: number) => {
    const stationSelectedParts = { ...(selectedParts[station] || {}) };
    console.log('partId:', partId, 'quantity:', quantity);
    
    if (quantity === 0) {
      delete stationSelectedParts[partId];
    } else {
      stationSelectedParts[partId] = quantity;
    }
    
    setSelectedParts({
      ...selectedParts,
      [station]: stationSelectedParts,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any parts are selected
    const hasParts = Object.values(selectedParts).some(stationParts => Object.keys(stationParts).length > 0);
    if (!hasParts) {
      setError("Please select at least one part.");
      return;
    }

    const emptyStations = Array.from(selectedStations).filter(
        (st) => !selectedParts[st] || Object.keys(selectedParts[st]).length === 0
      );
    if ( emptyStations.length > 0) {
      const newSelectedStations = new Set(selectedStations);
      emptyStations.forEach((st) => newSelectedStations.delete(st));
      setSelectedStations(newSelectedStations);
    }

    setSubmitLoading(true);
    try {
      // Include Rank Parts if any selected
      let rankPartIds: string[] = [];
      const selectedPartsCopy = { ...selectedParts };
      if (selectedPartsCopy["Rank Parts"]){
        // Repeat part IDs based on their quantities
        Object.entries(selectedPartsCopy["Rank Parts"]).forEach(([partId, quantity]) => {
          for (let i = 0; i < quantity; i++) {
            rankPartIds.push(partId);
          }
        });
        delete selectedPartsCopy["Rank Parts"];
      }
      
      // Convert to Array for API, repeating part IDs based on quantities
      const stationPartIds: string[] = [];
      Object.values(selectedPartsCopy).forEach((partsRecord) => {
        Object.entries(partsRecord).forEach(([partId, quantity]) => {
          for (let i = 0; i < quantity; i++) {
            stationPartIds.push(partId);
          }
        });
      });

      const payload = {
        stationPartIds,
        rankPartIds,
      };
      console.log("Submitting kanban request with payload:", JSON.stringify(payload));
      await createPreparationKanban(payload);
      handleDialogClose();
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (formLoading) {
    return (
      <Dialog open={requestFormOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={requestFormOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise Kanban Request</DialogTitle>
          <DialogDescription>
            Select stations and their parts to raise a Kanban request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <SearchBar onSearch={handleSearchFilter} debounceMs={1000} placeholder="Search for parts" className="w-full" />
          </div>
          <ScrollArea className="h-64 rounded-md border border-gray-700 p-2">
            <div className="flex items-center gap-2">
              <button type="button" title="toggle_rank_parts" onClick={()=> setShowRankParts(!showRankParts)}>
                <ChevronDown className={`h-4 w-4 ${showRankParts ? "hidden": ''}`}/>
                <ChevronUp className={`h-4 w-4 ${!showRankParts ? "hidden": ''}`}/>
              </button>
              <label 
                htmlFor={`rank_parts`} 
                className="text-xs md:text-sm font-medium text-gray-300 cursor-pointer"
                onClick={()=> setShowRankParts(!showRankParts)}
              >
                Rank Parts
              </label>
            </div>
            {/* Rank Parts list */}
            {rankParts.length > 0 && showRankParts && (
              <div className="ml-6 my-2 space-y-2">
                {rankParts.map((part) => (
                  <div key={part.id} className="mr-6 flex items-center space-x-2 justify-between">
                    <label
                      className="text-xs md:text-sm text-gray-300"
                    >
                      Part # {part.partId}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={selectedParts["Rank Parts"]?.[String(part.id)] || 0}
                      onChange={(e) => togglePart("Rank Parts", String(part.id), parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                    />
                  </div>
                ))}
              </div>
            )}
            {/* Stations list */}
            {Object.keys(stationParts).map((station) => (
              <div key={station} className="my-3">
                {/* Station checkbox */}
                <div className="flex items-center space-x-2">
                  {/* <Checkbox
                    id={`station-${station}`}
                    checked={selectedStations.has(station)}
                    onCheckedChange={() => toggleStation(station)}
                  /> */}
                  <button type="button" title={`toggle_${station}`} onClick={()=> toggleStation(station)}>
                    <ChevronDown className={`h-4 w-4 ${selectedStations.has(station) ? "hidden": ''}`}/>
                    <ChevronUp className={`h-4 w-4 ${!selectedStations.has(station) ? "hidden": ''}`}/>
                  </button>
                  <label
                    htmlFor={`station-${station}`}
                    className="text-xs md:text-sm font-medium text-gray-300"
                    onClick={()=> toggleStation(station)}
                  >
                    {station}
                  </label>
                </div>

                {/* Parts list (only show if station selected) */}
                {selectedStations.has(station) && (
                  <div className="ml-6 mt-2 space-y-2">
                    {stationParts[station].map((part) => (
                      <div key={part.id} className="mr-6 flex items-center space-x-2 justify-between">
                        <label
                          className="text-xs md:text-sm text-gray-300"
                        >
                          Part # {part.partIdNo}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={selectedParts[station]?.[String(part.id)] || 0}
                          onChange={(e) => togglePart(station, String(part.id), parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-xs text-center"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
          </ScrollArea>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={submitLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-xs md:text-sm text-white"
          >
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>

          {/* Error message */}
          {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default KanbanRequestsForm;
