import '../global.css';

import { ThemeToggle } from '@/components/ThemeToggle';
import { setAndroidNavigationBar } from '@/lib/android-navigation-bar';
import { NAV_THEME } from '@/lib/constants';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import React, { useRef } from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
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
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
    <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Departures',
          headerRight: () => <ThemeToggle />,
        }}
      />
    </Stack>
  </ThemeProvider>;
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;
