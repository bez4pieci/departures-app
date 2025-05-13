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

      const results = await client.departures(Viktoria, {
        duration: 30,
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

  const renderItem = ({ item }: { item: Departure }) => {
    const isDelayed = item.when && item.plannedWhen && item.when !== item.plannedWhen;
    const displayTime = item.when || item.plannedWhen;

    return (
      <Card className={`mb-1.5 font-departure-mono ${item.cancelled ? 'opacity-50' : ''}`}>
        <CardContent className="p-2 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-20 mr-3">
              <Text className={`text-base font-medium ${isDelayed ? 'text-destructive' : ''}`}>
                {displayTime ? formatTime(displayTime) : '?'}
              </Text>
              {isDelayed && item.plannedWhen && (
                <Text className="text-muted-foreground text-xs">
                  {formatTime(item.plannedWhen)}
                </Text>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium">{item.line}</Text>
              <Text className={`text-sm text-muted-foreground ${item.cancelled ? 'line-through' : ''}`}>
                {item.direction}
              </Text>
            </View>
          </View>
          {item.cancelled && (
            <Text className="text-destructive text-sm ml-2">Cancelled</Text>
          )}
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <Card className="m-2">
        <CardContent className="p-2">
          <Text className="text-destructive">{error}</Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <View className='flex-1 bg-background'>
      <Text style={{ fontFamily: 'DepartureMono-Regular' }}>DepartureMono-Regular</Text>
      <Text className='font-departure-mono'>DepartureMono-Regular</Text>
      <FlatList
        data={departures}
        renderItem={renderItem}
        keyExtractor={(item) => item.tripId}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ padding: 8 }}
      />
    </View>
  );
}
