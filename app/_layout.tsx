import '../global.css';

import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { NAV_THEME } from '@/lib/constants';
import { StationProvider, useStation } from '@/lib/station-context';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import { Platform, TouchableOpacity } from 'react-native';

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

function StackNavigator() {
  const router = useRouter();
  const { selectedStation } = useStation();

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{
        headerTitleAlign: 'left',
        headerTitleStyle: { fontFamily: 'DepartureMono-Regular' },
      }}>
        <Stack.Screen
          name='index'
          options={{
            title: selectedStation?.name && selectedStation.name.length > 30 ? selectedStation.name.slice(0, 27).concat('...') : (selectedStation?.name || 'Departures'),
            headerLargeTitle: true,
            headerLargeTitleStyle: { fontFamily: 'DepartureMono-Regular' },
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push('/settings')}
                className="mr-4"
              >
                <Ionicons name="settings-outline" size={24} color={NAV_THEME.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name='settings'
          options={{
            title: 'Select a station',
            presentation: 'modal',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-4"
              >
                <Ionicons name="checkmark" size={24} color={NAV_THEME.dark.text} />
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const hasMounted = useRef(false);
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  if (Platform.OS === 'web') {
    const [fontsLoaded] = useFonts({
      'DepartureMono-Regular': require('../assets/fonts/DepartureMono-Regular.otf'),
    });
    if (!fontsLoaded) {
      return null;
    }
  }

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setAndroidNavigationBar('dark');
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <StationProvider>
      <ThemeProvider value={DARK_THEME}>
        <StackNavigator />
      </ThemeProvider>
    </StationProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
