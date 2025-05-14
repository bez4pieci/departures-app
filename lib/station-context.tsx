import React, { createContext, useContext, useState } from 'react';

type Station = {
    id: string;
    name: string;
    type: 'station' | 'stop' | 'location';
};

type StationContextType = {
    selectedStation: Station | null;
    setSelectedStation: (station: Station | null) => void;
};

const StationContext = createContext<StationContextType | undefined>(undefined);

export function StationProvider({ children }: { children: React.ReactNode }) {
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    return (
        <StationContext.Provider value={{ selectedStation, setSelectedStation }}>
            {children}
        </StationContext.Provider>
    );
}

export function useStation() {
    const context = useContext(StationContext);
    if (context === undefined) {
        throw new Error('useStation must be used within a StationProvider');
    }
    return context;
} 
