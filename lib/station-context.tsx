import { ExtensionStorage } from "@bacons/apple-targets";
import React, { createContext, useContext, useEffect, useState } from "react";

type Station = {
  id: string;
  name: string;
  type: "station" | "stop" | "location";
};

type StationContextType = {
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
};

const StationContext = createContext<StationContextType | undefined>(undefined);

// Create ExtensionStorage instance with app group
const extensionStorage = new ExtensionStorage("group.com.bez4pieci.departures");

export function StationProvider({ children }: { children: React.ReactNode }) {
  const [selectedStation, setSelectedStationState] = useState<Station | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved station on mount
  useEffect(() => {
    const loadSavedStation = () => {
      try {
        const stationData = extensionStorage.get("selectedStation");
        if (stationData) {
          const station = JSON.parse(stationData) as Station;
          setSelectedStationState(station);
        }
      } catch (error) {
        console.log("Error loading saved station:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSavedStation();
  }, []);

  const setSelectedStation = (station: Station | null) => {
    setSelectedStationState(station);

    try {
      if (station) {
        // ExtensionStorage can handle objects directly, but let's use JSON for compatibility
        extensionStorage.set("selectedStation", JSON.stringify(station));
        // Also trigger widget reload
        ExtensionStorage.reloadWidget();
      } else {
        extensionStorage.remove("selectedStation");
        ExtensionStorage.reloadWidget();
      }
    } catch (error) {
      console.log("Error saving station:", error);
    }
  };

  return <StationContext.Provider value={{ selectedStation, setSelectedStation }}>{children}</StationContext.Provider>;
}

export function useStation() {
  const context = useContext(StationContext);
  if (context === undefined) {
    throw new Error("useStation must be used within a StationProvider");
  }
  return context;
}
