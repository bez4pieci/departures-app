import { Card, CardContent } from '@/components/ui/card';
import { Text, TextClassContext } from '@/components/ui/text';
import { useStation } from '@/lib/station-context';
import { createClient } from 'hafas-client';
import { profile as bvgProfile } from 'hafas-client/p/bvg';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from "react-native";

const client = createClient(bvgProfile, 'bez4pieci-test');

type FormattedDeparture = {
  tripId: string;
  line: string;
  direction: string;
  plannedWhen: string | undefined;
  when: string | undefined;
  cancelled: boolean | undefined;
};


export default function Index() {
  const { selectedStation } = useStation();
  const [departures, setDepartures] = useState<FormattedDeparture[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartures = useCallback(async () => {
    if (!selectedStation) {
      setError('Please select a station in settings');
      return;
    }

    try {
      setError(null);

      const results = await client.departures(selectedStation.id, {
        duration: 60,
        linesOfStops: true,
        remarks: false,
        language: 'en',
      });
      const formattedDepartures = results.departures.map(departure => {
        if (!departure.tripId) {
          console.warn('Departure is missing tripId:', departure);
          return null;
        }

        return {
          tripId: departure.tripId,
          line: departure.line?.name || '?',
          direction: departure.direction || 'Unknown',
          plannedWhen: departure.plannedWhen,
          when: departure.when,
          cancelled: departure.cancelled,
        };
      }).filter((d): d is FormattedDeparture => d !== null);

      // Sort departures by actual departure time (when), falling back to planned time if when is not available
      const sortedDepartures = formattedDepartures.sort((a, b) => {
        const timeA = a.when || a.plannedWhen;
        const timeB = b.when || b.plannedWhen;

        if (!timeA) return 1;  // Put undefined times at the end
        if (!timeB) return -1;

        return new Date(timeA).getTime() - new Date(timeB).getTime();
      });

      setDepartures(sortedDepartures);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departures');
    }
  }, [selectedStation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDepartures();
    setRefreshing(false);
  }, [fetchDepartures]);

  useEffect(() => {
    fetchDepartures();
  }, [fetchDepartures]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (error) {
    return (
      <Card className="m-2">
        <CardContent className="p-2">
          <Text className="text-destructive font-departure-mono">{error}</Text>
        </CardContent>
      </Card>
    );
  }

  if (!selectedStation) {
    return (
      <Card className="m-2">
        <CardContent className="p-2">
          <Text className="text-muted-foreground font-departure-mono">
            Please select a station in settings to view departures
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <FlatList
      data={departures}
      contentInsetAdjustmentBehavior="automatic"
      renderItem={({ item }) => {
        const isDelayed = item.when && item.plannedWhen && item.when !== item.plannedWhen;
        const displayTime = item.when || item.plannedWhen;
        return (
          <TextClassContext.Provider value="font-departure-mono">
            <View className={`border-b border-solid border-border`}>
              <View className={`flex-row items-start px-2 py-3 ${item.cancelled ? 'opacity-40' : ''}`}>
                <View className="w-32">
                  <Text className={`text-3xl font-bold ${item.cancelled && 'line-through'}`}>{displayTime ? formatTime(displayTime) : '?'}</Text>
                  {isDelayed && item.plannedWhen && (
                    <Text className="text-base text-muted-foreground line-through">{formatTime(item.plannedWhen)}</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-3xl font-bold ${item.cancelled && 'line-through'}`}>{item.line}</Text>
                  <Text className={`text-base font-departure-mono ml-1`}>{item.direction}</Text>
                </View>
              </View>
            </View>
          </TextClassContext.Provider>
        );
      }}
      keyExtractor={(item) => item.tripId}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
