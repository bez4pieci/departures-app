import { Text } from '@/components/ui/text';
import { useStation } from '@/lib/station-context';
import createClient from '@/utils/hafas-rest-api-client';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';

const client = createClient('http://localhost:3333', {
    userAgent: 'bez4pieci-test',
});

type Station = {
    id: string;
    name: string;
    type: 'station' | 'stop' | 'location';
};

export default function Settings() {
    const router = useRouter();
    const { selectedStation, setSelectedStation } = useStation();
    const [searchQuery, setSearchQuery] = useState('');
    const [stations, setStations] = useState<Station[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchStations = useCallback(async (query: string) => {
        if (!query.trim()) {
            setStations([]);
            return;
        }

        try {
            setIsSearching(true);
            setError(null);
            const results = await client.locations(query, {
                results: 10,
                language: 'en',
            });

            const formattedStations = results
                .filter((station) => station.id && station.name && (station.type === 'stop' || station.type === 'station'))
                .map(station => ({
                    id: String(station.id), // Ensure id is a string
                    name: String(station.name), // Ensure name is a string
                    type: station.type
                }));

            setStations(formattedStations);
        } catch (err) {
            console.error('Error searching stations:', err);
            setError(err instanceof Error ? err.message : 'Failed to search stations');
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchStations(searchQuery);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchStations]);

    const selectStation = (station: Station) => {
        setSelectedStation(station);
        router.back();
    };

    return (
        <View className="flex-1 bg-background p-4">
            {selectedStation && (
                <Text className="text-sm text-muted-foreground font-departure-mono mb-4">
                    Current: {selectedStation.name}
                </Text>
            )}

            <TextInput
                className="w-full p-2 border border-border rounded-md bg-card text-card-foreground font-departure-mono mb-4"
                placeholder="Search for a station..."
                placeholderTextColor="hsl(var(--muted-foreground))"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {error && (
                <Text className="text-destructive mb-2 font-departure-mono">{error}</Text>
            )}

            {isSearching && (
                <Text className="text-muted-foreground mb-2 font-departure-mono">Searching...</Text>
            )}

            <FlatList
                data={stations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => selectStation(item)}
                        className="p-3 border-b border-border active:bg-accent"
                    >
                        <Text className="text-lg font-departure-mono">{item.name}</Text>
                        <Text className="text-sm text-muted-foreground font-departure-mono">{item.type}</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    searchQuery.trim() ? (
                        <Text className="text-muted-foreground mt-4 text-center font-departure-mono">
                            No stations found
                        </Text>
                    ) : null
                }
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
} 
