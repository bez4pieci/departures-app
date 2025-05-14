import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import createClient from '@/utils/hafas-rest-api-client';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, View } from "react-native";

const client = createClient('http://localhost:3333', {
  userAgent: 'bez4pieci-test',
});

type Departure = {
  tripId: string;
  line: string;
  direction: string;
  plannedWhen: string | undefined;
  when: string | undefined;
  cancelled: boolean | undefined;
};


export default function Index() {
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartures = useCallback(async () => {
    try {
      setError(null);

      const Suedkreuz = '900058101';
      const Viktoria = '900055101';

      const results = await client.departures(Suedkreuz, {
        duration: 60,
        linesOfStops: true,
        remarks: false,
        language: 'en',
      });
      const formattedDepartures = results.departures.map(departure => ({
        tripId: departure.tripId,
        line: departure.line?.name || '?',
        direction: departure.direction || 'Unknown',
        plannedWhen: departure.plannedWhen,
        when: departure.when,
        cancelled: departure.cancelled,
      }));

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
  }, []);

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
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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

  return (
    <View className="flex-1 bg-background px-0 py-2">
      {/* Technical Header Row */}
      <View className="flex-row items-center border-b border-border bg-card/80 dark:bg-black/80 px-2 py-2 mb-1">
        <Text className="flex-[1.7] text-sm text-muted-foreground tracking-widest font-departure-mono uppercase">Time / Line</Text>
        <Text className="flex-[2.3] text-sm text-muted-foreground tracking-widest font-departure-mono uppercase">Direction</Text>
        <Text className="w-20 text-sm text-muted-foreground tracking-widest font-departure-mono uppercase text-right">Status</Text>
      </View>
      <FlatList
        data={departures}
        renderItem={({ item }) => {
          const isDelayed = item.when && item.plannedWhen && item.when !== item.plannedWhen;
          const displayTime = item.when || item.plannedWhen;
          return (
            <View
              className={`flex-row items-center border-b border-dashed border-border bg-card/60 dark:bg-black/60 px-2 py-3 font-departure-mono ${item.cancelled ? 'opacity-50' : ''}`}
            >
              {/* Time and Line */}
              <View className="flex-[1.7] justify-center items-start">
                <Text className={`text-3xl font-bold font-departure-mono ${isDelayed ? 'text-orange-500' : 'text-foreground'}`}>{displayTime ? formatTime(displayTime) : '?'}</Text>
                {isDelayed && item.plannedWhen && (
                  <Text className="text-xs text-muted-foreground font-departure-mono line-through">{formatTime(item.plannedWhen)}</Text>
                )}
                <Text className="text-lg font-semibold font-departure-mono text-foreground mt-1">{item.line}</Text>
              </View>
              {/* Direction */}
              <Text className={`flex-[2.3] text-base font-departure-mono ${item.cancelled ? 'line-through text-muted-foreground' : 'text-foreground'} ml-1`}>{item.direction}</Text>
              {/* Status */}
              <View className="w-20 items-end">
                {item.cancelled ? (
                  <Text className="text-red-600 text-base font-bold font-departure-mono uppercase">Cancelled</Text>
                ) : isDelayed ? (
                  <Text className="text-orange-500 text-base font-bold font-departure-mono uppercase">Delayed</Text>
                ) : null}
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.tripId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </View>
  );
}
