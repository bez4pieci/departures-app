import { useFonts } from 'expo-font';
import { Platform, Text, View } from "react-native";

export default function Index() {
  if (Platform.OS === 'web') {
    const [fontsLoaded] = useFonts({
      'DepartureMono-Regular': require('../assets/fonts/DepartureMono-Regular.otf'),
    });
    if (!fontsLoaded) {
      return null;
    }
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-red-500 font-departure-mono text-2xl">...</Text>
    </View>
  );
}
