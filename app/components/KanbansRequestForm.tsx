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
import { createPreparationKanban, fetchStationParts } from "../lib/api";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

function KanbanRequestsForm({
  requestFormOpen,
  setRequestFormOpen,
}: {
  requestFormOpen: boolean;
  setRequestFormOpen: (open: boolean) => void;
}) {
  const [stationParts, setStationParts] = useState<Record<string, number[]>>({});
  const [formLoading, setFormLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track selected stations and parts
  const [selectedStations, setSelectedStations] = useState<Set<string>>(new Set());
  const [selectedParts, setSelectedParts] = useState<Record<string, Set<number>>>({});

  // Fetch stations and parts only once when dialog opens
  useEffect(() => {
    if (!requestFormOpen) return;

    const fetchParts = async () => {
      setFormLoading(true);
      try {
        const parts = await fetchStationParts();
        if (!parts || parts.length === 0) {
          setError("No station parts found.");
          return;
        }

        const stationPartMap: Record<string, number[]> = parts.reduce((acc, part) => {
          const stationName = part.stationName;
          if (!acc[stationName]) {
            acc[stationName] = [];
          }
          acc[stationName].push(part.partIdNo);
          return acc;
        }, {} as Record<string, number[]>);

        setStationParts(stationPartMap);
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

  const togglePart = (station: string, partId: number) => {
    const stationSelectedParts = new Set(selectedParts[station] || []);
    if (stationSelectedParts.has(partId)) {
      stationSelectedParts.delete(partId);
    } else {
      stationSelectedParts.add(partId);
    }
    setSelectedParts({
      ...selectedParts,
      [station]: stationSelectedParts,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStations.size === 0) {
      setError("Please select at least one station.");
      return;
    }
    if (
      Array.from(selectedStations).some(
        (st) => !selectedParts[st] || selectedParts[st].size === 0
      )
    ) {
      setError("Please select at least one part for each selected station.");
      return;
    }

    setSubmitLoading(true);
    try {
      // Convert Set to Array for API
      const requestPayload = Array.from(selectedStations).map((station) => ({
        station,
        parts: Array.from(selectedParts[station] || []),
      }));

      await createPreparationKanban(requestPayload);
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
          <ScrollArea className="h-64 rounded-md border border-gray-700 p-2">
            {/* Stations list */}
            {Object.keys(stationParts).map((station) => (
              <div key={station} className="mb-3">
                {/* Station checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`station-${station}`}
                    checked={selectedStations.has(station)}
                    onCheckedChange={() => toggleStation(station)}
                  />
                  <label
                    htmlFor={`station-${station}`}
                    className="text-xs md:text-sm font-medium text-gray-300"
                  >
                    {station}
                  </label>
                </div>

                {/* Parts list (only show if station selected) */}
                {selectedStations.has(station) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {stationParts[station].map((partId) => (
                      <div key={partId} className="flex items-center space-x-2">
                        <Checkbox
                          id={`part-${station}-${partId}`}
                          checked={selectedParts[station]?.has(partId) || false}
                          onCheckedChange={() => togglePart(station, partId)}
                        />
                        <label
                          htmlFor={`part-${station}-${partId}`}
                          className="text-xs md:text-sm text-gray-300"
                        >
                          Part #{partId}
                        </label>
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
