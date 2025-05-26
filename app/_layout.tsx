import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Reusemart", headerShown: false }}
      />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
